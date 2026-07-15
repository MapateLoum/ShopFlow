const router = require("express").Router();
const { protect, isSeller } = require("../middleware/auth.middleware");
const {
  createOrder,
  getMyOrders,
  updateOrderStatus,
  getOrderStats,
  confirmPayment,
  rejectPayment,
  getOrderTracking,
  requestOrderHistory,
  getOrderHistory,
} = require("../controllers/order.controller");

// Routes publiques : client passe commande / suit sa commande / retrouve son historique
router.post("/", createOrder);
router.get("/:id/track", getOrderTracking);
router.post("/request-history", requestOrderHistory);
router.get("/history", getOrderHistory);

// Routes protégées vendeur
router.get("/", protect, isSeller, getMyOrders);
router.get("/stats", protect, isSeller, getOrderStats);
router.patch("/:id/status", protect, isSeller, updateOrderStatus);
router.patch("/:id/confirm-payment", protect, isSeller, confirmPayment);
router.patch("/:id/reject-payment", protect, isSeller, rejectPayment);

module.exports = router;