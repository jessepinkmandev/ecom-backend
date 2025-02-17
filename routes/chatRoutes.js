const chatController = require("../controllers/Dashboard/chatController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = require("express").Router();

router.post("/chat/add-friend", chatController.add_friend);
router.post("/chat/send-message", chatController.send_message);
router.post(
  "/chat/message-send-seller-admin",
  chatController.seller_admin_message_insert
);
router.post(
  "/chat/send-customer-message",
  authMiddleware,
  chatController.send_customer_message
);
router.get("/chat/get-customers/:sellerId", chatController.get_customers);
router.get(
  "/chat/admin/get-sellers",
  authMiddleware,
  chatController.get_sellers
);
router.get(
  "/chat/get-customer-message/:customerId",
  authMiddleware,
  chatController.get_customer_message
);
router.get(
  "/chat/message-get-seller-admin/:receiverId",
  authMiddleware,
  chatController.get_admin_message
);
router.get(
  "/chat/message-get-seller",
  authMiddleware,
  chatController.get_seller_message
);

module.exports = router;
