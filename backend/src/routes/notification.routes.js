const router = require("express").Router();
const { protect, isSeller } = require("../middleware/auth.middleware");
const prisma = require("../utils/prisma");

router.use(protect, isSeller);

router.get("/", async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { sellerId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json({ success: true, notifications });
  } catch {
    res.status(500).json({ success: false, message: "Erreur" });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Erreur" });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { sellerId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Erreur" });
  }
});

module.exports = router;
