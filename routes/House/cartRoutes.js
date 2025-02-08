const cartController = require("../../controllers/Dashboard/cartController");
const router = require("express").Router();

router.post("/cart/add-to-cart", cartController.add_to_cart);
router.get("/cart/get-cart/:userId", cartController.get_cart);
router.put(
  "/cart/quantity-increment/:cartId",
  cartController.quantity_increment
);
router.put(
  "/cart/quantity-decrement/:cartId",
  cartController.quantity_decrement
);
router.delete(
  "/cart/delete-cart-product/:cartId",
  cartController.delete_cart_product
);

module.exports = router;
