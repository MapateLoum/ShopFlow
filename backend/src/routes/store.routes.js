const router = require("express").Router();
const { protect, isSeller } = require("../middleware/auth.middleware");
const { upload } = require("../utils/cloudinary");
const { getMyStore, updateStore } = require("../controllers/store.controller");
const multer = require("multer");

router.use(protect, isSeller);
router.get("/me", getMyStore);
router.put(
  "/me",
  upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]),
  updateStore
);

module.exports = router;
