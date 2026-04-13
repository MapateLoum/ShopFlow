const prisma = require("../utils/prisma");

// Page boutique publique par slug
const getStoreBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const store = await prisma.store.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        products: { where: { isAvailable: true }, orderBy: { createdAt: "desc" } },
        seller: { select: { name: true, phone: true } },
      },
    });
    if (!store) return res.status(404).json({ success: false, message: "Boutique introuvable" });
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

// Liste toutes les boutiques actives
const getAllStores = async (req, res) => {
  try {
    const stores = await prisma.store.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true, name: true, slug: true, description: true,
        logoUrl: true, bannerUrl: true, primaryColor: true,
        _count: { select: { products: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, stores });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

module.exports = { getStoreBySlug, getAllStores };
