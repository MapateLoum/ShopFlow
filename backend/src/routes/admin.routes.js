const router = require("express").Router();
const { protect, isSuperAdmin } = require("../middleware/auth.middleware");
const {
  getAllSellers,
  activateSeller,
  suspendSeller,
  getStats,
} = require("../controllers/admin.controller");

router.use(protect, isSuperAdmin);
router.get("/sellers", getAllSellers);
router.patch("/sellers/:id/activate", activateSeller);
router.patch("/sellers/:id/suspend", suspendSeller);
router.get("/stats", getStats);

module.exports = router;
