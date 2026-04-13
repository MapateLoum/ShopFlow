const prisma = require("../utils/prisma");
const { upload } = require("../utils/cloudinary");

const getMyStore = async (req, res) => {
  try {
    const store = await prisma.store.findUnique({
      where: { sellerId: req.user.id },
      include: { products: true },
    });
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

const updateStore = async (req, res) => {
  try {
    const { name, description, primaryColor, waveBusinessNumber } = req.body;
    const logoUrl = req.files?.logo?.[0]?.path;
    const bannerUrl = req.files?.banner?.[0]?.path;

    const data = { name, description, primaryColor, waveBusinessNumber };
    if (logoUrl) data.logoUrl = logoUrl;
    if (bannerUrl) data.bannerUrl = bannerUrl;

    const store = await prisma.store.update({
      where: { sellerId: req.user.id },
      data,
    });
    res.json({ success: true, store });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur mise à jour boutique" });
  }
};

module.exports = { getMyStore, updateStore };
