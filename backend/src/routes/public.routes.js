const router = require("express").Router();
const { getStoreBySlug, getAllStores } = require("../controllers/public.controller");

router.get("/stores", getAllStores);
router.get("/stores/:slug", getStoreBySlug);

module.exports = router;
