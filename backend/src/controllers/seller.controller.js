const prisma = require("../utils/prisma");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const seller = await prisma.seller.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, phone: true, status: true, createdAt: true },
    });
    res.json({ success: true, seller });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const seller = await prisma.seller.update({
      where: { id: req.user.id },
      data: { name, phone },
      select: { id: true, name: true, email: true, phone: true },
    });
    res.json({ success: true, seller });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const seller = await prisma.seller.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, seller.passwordHash);
    if (!valid) return res.status(400).json({ success: false, message: "Mot de passe actuel incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.seller.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ success: true, message: "Mot de passe mis à jour" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
