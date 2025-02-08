const orderController = require("../../controllers/Order/orderController");
const router = require("express").Router();

router.post("/order/place-order", orderController.place_order);

module.exports = router;
