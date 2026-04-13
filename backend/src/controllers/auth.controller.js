const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { generateOTP, generateToken, otpExpiresAt } = require("../utils/auth.utils");
const { sendOTPEmail } = require("../emails/mailer");
const slugify = require("slugify");

// ─── SELLER REGISTER (step 1: envoie OTP) ────────────────────────────────────
const sellerRegister = async (req, res) => {
  try {
    const { name, email, phone, password, storeName, storeDescription, primaryColor, waveBusinessNumber } = req.body;

    const exists = await prisma.seller.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ success: false, message: "Email déjà utilisé" });

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOTP();

    // Générer slug unique pour la boutique
    let slug = slugify(storeName, { lower: true, strict: true });
    const slugExists = await prisma.store.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now()}`;

    const seller = await prisma.seller.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        otpCode: otp,
        otpExpiresAt: otpExpiresAt(),
        store: {
          create: {
            name: storeName,
            slug,
            description: storeDescription || "",
            primaryColor: primaryColor || "#6C63FF",
            waveBusinessNumber: waveBusinessNumber || "",
          },
        },
      },
    });

    await sendOTPEmail(email, name, otp, "register");
    res.status(201).json({ success: true, message: "Code OTP envoyé à votre email", sellerId: seller.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Erreur lors de l'inscription" });
  }
};

// ─── VERIFY OTP (inscription) ─────────────────────────────────────────────────
const verifyOTP = async (req, res) => {
  try {
    const { sellerId, otp } = req.body;

    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) return res.status(404).json({ success: false, message: "Vendeur introuvable" });
    if (seller.isVerified) return res.status(400).json({ success: false, message: "Compte déjà vérifié" });
    if (seller.otpCode !== otp) return res.status(400).json({ success: false, message: "Code incorrect" });
    if (new Date() > seller.otpExpiresAt) return res.status(400).json({ success: false, message: "Code expiré" });

    await prisma.seller.update({
      where: { id: sellerId },
      data: { isVerified: true, otpCode: null, otpExpiresAt: null },
    });

    res.json({ success: true, message: "Compte vérifié ! En attente de validation par l'admin." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur de vérification" });
  }
};

// ─── SELLER LOGIN ──────────────────────────────────────────────────────────────
const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await prisma.seller.findUnique({
      where: { email },
      include: { store: true },
    });

    if (!seller) return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });
    if (!seller.isVerified) return res.status(403).json({ success: false, message: "Vérifiez d'abord votre email" });
    if (seller.status !== "ACTIVE") return res.status(403).json({ success: false, message: "Compte en attente de validation" });

    const valid = await bcrypt.compare(password, seller.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });

    const token = generateToken({ id: seller.id, role: "SELLER", storeId: seller.store?.id });
    res.json({
      success: true,
      token,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        store: seller.store,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur de connexion" });
  }
};

// ─── SUPER ADMIN LOGIN ─────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.superAdmin.findUnique({ where: { email } });
    if (!admin) return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect" });

    const token = generateToken({ id: admin.id, role: "SUPER_ADMIN" });
    res.json({ success: true, token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur de connexion" });
  }
};

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const seller = await prisma.seller.findUnique({ where: { email } });
    if (!seller) return res.status(404).json({ success: false, message: "Email introuvable" });

    const otp = generateOTP();
    await prisma.seller.update({
      where: { email },
      data: { otpCode: otp, otpExpiresAt: otpExpiresAt() },
    });

    await sendOTPEmail(email, seller.name, otp, "reset");
    res.json({ success: true, message: "Code OTP envoyé à votre email", sellerId: seller.id });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de l'envoi" });
  }
};

// ─── VERIFY RESET OTP ──────────────────────────────────────────────────────────
const verifyResetOTP = async (req, res) => {
  try {
    const { sellerId, otp } = req.body;
    const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
    if (!seller) return res.status(404).json({ success: false, message: "Vendeur introuvable" });
    if (seller.otpCode !== otp) return res.status(400).json({ success: false, message: "Code incorrect" });
    if (new Date() > seller.otpExpiresAt) return res.status(400).json({ success: false, message: "Code expiré" });

    // Token temporaire pour reset
    const resetToken = generateToken({ id: seller.id, role: "RESET" });
    await prisma.seller.update({ where: { id: sellerId }, data: { otpCode: null, otpExpiresAt: null } });

    res.json({ success: true, resetToken });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur de vérification" });
  }
};

// ─── RESET PASSWORD ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    const { verifyToken } = require("../utils/auth.utils");
    const decoded = verifyToken(resetToken);
    if (decoded.role !== "RESET") return res.status(403).json({ success: false, message: "Token invalide" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.seller.update({ where: { id: decoded.id }, data: { passwordHash } });

    res.json({ success: true, message: "Mot de passe réinitialisé avec succès" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur lors de la réinitialisation" });
  }
};

module.exports = { sellerRegister, verifyOTP, sellerLogin, adminLogin, forgotPassword, verifyResetOTP, resetPassword };
