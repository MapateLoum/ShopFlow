const prisma = require("../utils/prisma");
const { sendWelcomeEmail } = require("../emails/mailer");

// Liste tous les vendeurs
const getAllSellers = async (req, res) => {
  try {
    const sellers = await prisma.seller.findMany({
      include: { store: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

// Valider / activer un vendeur
const activateSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await prisma.seller.findUnique({ where: { id }, include: { store: true } });
    if (!seller) return res.status(404).json({ success: false, message: "Vendeur introuvable" });

    await prisma.seller.update({ where: { id }, data: { status: "ACTIVE" } });
    await prisma.store.update({ where: { sellerId: id }, data: { status: "ACTIVE" } });

    await sendWelcomeEmail(seller.email, seller.name, seller.store.slug);
    res.json({ success: true, message: "Vendeur activé avec succès" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

// Suspendre un vendeur
const suspendSeller = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.seller.update({ where: { id }, data: { status: "SUSPENDED" } });
    await prisma.store.update({ where: { sellerId: id }, data: { status: "SUSPENDED" } });
    res.json({ success: true, message: "Vendeur suspendu" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

// Stats globales
const getStats = async (req, res) => {
  try {
    const [totalSellers, activeSellers, totalOrders, totalStores] = await Promise.all([
      prisma.seller.count(),
      prisma.seller.count({ where: { status: "ACTIVE" } }),
      prisma.order.count(),
      prisma.store.count({ where: { status: "ACTIVE" } }),
    ]);

    const orders = await prisma.order.findMany({ select: { totalAmount: true } });
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      stats: { totalSellers, activeSellers, totalOrders, totalStores, totalRevenue },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

module.exports = { getAllSellers, activateSeller, suspendSeller, getStats };
