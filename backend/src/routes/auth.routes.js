const router = require("express").Router();
const {
  sellerRegister,
  verifyOTP,
  sellerLogin,
  adminLogin,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
} = require("../controllers/auth.controller");

router.post("/seller/register", sellerRegister);
router.post("/seller/verify-otp", verifyOTP);
router.post("/seller/login", sellerLogin);
router.post("/seller/forgot-password", forgotPassword);
router.post("/seller/verify-reset-otp", verifyResetOTP);
router.post("/seller/reset-password", resetPassword);
router.post("/admin/login", adminLogin);

module.exports = router;
