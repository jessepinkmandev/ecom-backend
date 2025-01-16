const houseControllers = require("../../controllers/house/houseControllers");

const router = require("express").Router();
router.get("/get-categorys", houseControllers.get_categorys);
router.get("/get-products", houseControllers.get_products);

module.exports = router;
