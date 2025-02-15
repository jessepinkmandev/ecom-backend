const chatController = require("../controllers/Dashboard/chatController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const router = require("express").Router();

router.post("/chat/add-friend", chatController.add_friend);
router.post("/chat/send-message", chatController.send_message);

module.exports = router;
