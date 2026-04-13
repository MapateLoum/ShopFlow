const router = require("express").Router();
const { protect, isSeller } = require("../middleware/auth.middleware");
const { upload } = require("../utils/cloudinary");
const {
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

router.use(protect, isSeller);
router.get("/", getMyProducts);
router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
