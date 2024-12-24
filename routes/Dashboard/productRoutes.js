const productController = require("../../controllers/Dashboard/productController");
const { authMiddleware } = require("../../middlewares/authMiddleware");

const router = require("express").Router();

router.post("/product-add", authMiddleware, productController.add_product);
router.post(
  "/product-image-update",
  authMiddleware,
  productController.product_image_update
);
router.get("/product-get", authMiddleware, productController.get_product);
router.get(
  "/productone-get/:productId",
  authMiddleware,
  productController.get_productone
);
router.post(
  "/product-update",
  authMiddleware,
  productController.update_product
);

module.exports = router;
