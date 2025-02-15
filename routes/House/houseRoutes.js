const houseControllers = require("../../controllers/house/houseControllers");
const router = require("express").Router();

router.get("/get-categorys", houseControllers.get_categorys);
router.get("/get-products", houseControllers.get_products);
router.get("/price-range-latest-product", houseControllers.price_range_product);
router.get("/query-products", houseControllers.query_products);
router.get("/product-details/:slug", houseControllers.product_details);
router.post("/customer/submit-review", houseControllers.product_review);
router.get("/customer/get-review/:productId", houseControllers.get_review);

module.exports = router;
