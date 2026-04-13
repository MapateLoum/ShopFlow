const prisma = require("../utils/prisma");
const { cloudinary } = require("../utils/cloudinary");

const getMyProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { storeId: req.user.storeId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const imageUrl = req.file?.path || null;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
        storeId: req.user.storeId,
      },
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur création produit" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, isAvailable } = req.body;

    const existing = await prisma.product.findFirst({ where: { id, storeId: req.user.storeId } });
    if (!existing) return res.status(404).json({ success: false, message: "Produit introuvable" });

    const imageUrl = req.file?.path || existing.imageUrl;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        isAvailable: isAvailable === "true" || isAvailable === true,
        imageUrl,
      },
    });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur mise à jour" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.product.findFirst({ where: { id, storeId: req.user.storeId } });
    if (!existing) return res.status(404).json({ success: false, message: "Produit introuvable" });

    if (existing.imageUrl) {
      const publicId = existing.imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`shopflow/${publicId}`);
    }

    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: "Produit supprimé" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur suppression" });
  }
};

module.exports = { getMyProducts, createProduct, updateProduct, deleteProduct };
