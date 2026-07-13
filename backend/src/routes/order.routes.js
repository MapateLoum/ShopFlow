const router = require("express").Router();
const { protect, isSeller } = require("../middleware/auth.middleware");
const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getOrderStats,
  confirmPayment,
  rejectPayment,
} = require("../controllers/order.controller");

// Route publique : client passe commande
router.post("/", createOrder);

// Routes protégées vendeur
router.get("/", protect, isSeller, getMyOrders);
router.get("/stats", protect, isSeller, getOrderStats);
router.patch("/:id/status", protect, isSeller, updateOrderStatus);
router.patch("/:id/confirm-payment", protect, isSeller, confirmPayment);
router.patch("/:id/reject-payment", protect, isSeller, rejectPayment);

module.exports = router;