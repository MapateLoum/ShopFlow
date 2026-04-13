const router = require("express").Router();
const { protect, isSeller } = require("../middleware/auth.middleware");
const { getProfile, updateProfile, changePassword } = require("../controllers/seller.controller");

router.use(protect, isSeller);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.patch("/change-password", changePassword);

module.exports = router;
