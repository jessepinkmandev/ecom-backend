const orderController = require("../../controllers/Order/orderController");
const router = require("express").Router();

router.post("/order/place-order", orderController.place_order);
router.get("/order/get-orders/:customerId/:status", orderController.get_order);
router.get("/get-admin-orders", orderController.get_admin_orders);
router.get(
  "/order/get-order-details/:orderId",
  orderController.get_order_details
);
router.get(
  "/dashboard/get-dashboard-data/:userId",
  orderController.get_dashboard_data
);

module.exports = router;
