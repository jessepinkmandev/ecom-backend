const productModel = require("../../models/productModel");
const cartModel = require("../../models/cartModel");
const wishlistModel = require("../../models/wishlistModel");
const { responseReturn } = require("../../utilities/response");
const {
  mongo: { ObjectId },
} = require("mongoose");

class cartController {
  add_to_cart = async (req, res) => {
    const { userId, quantity, productId } = req.body;
    try {
      const product = await cartModel.findOne({
        $and: [
          {
            productId: {
              $eq: productId,
            },
          },
          {
            userId: {
              $eq: userId,
            },
          },
        ],
      });
      //
      if (product) {
        responseReturn(res, 404, { error: "Product Already Added To Cart" });
      } else {
        const product = await cartModel.create({
          userId,
          productId,
          quantity,
        });
        responseReturn(res, 201, {
          message: "Product Added To Cart Successfully",
        });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  //
  get_cart = async (req, res) => {
    const commission = 5;
    const { userId } = req.params;
    try {
      const cart_products = await cartModel.aggregate([
        {
          $match: { userId: { $eq: new ObjectId(userId) } },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "products",
          },
        },
      ]);
      let buy_product_item = 0;
      let calculated_price = 0;
      let cart_product_count = 0;

      const outofstock = cart_products.filter(
        (p) => p.products[0].stock < p.quantity
      );

      for (let i = 0; i < outofstock.length; i++) {
        cart_product_count = cart_product_count + outofstock[i].quantity;
      }

      const stockProduct = cart_products.filter(
        (p) => p.products[0].stock >= p.quantity
      );

      for (let i = 0; i < stockProduct.length; i++) {
        const { quantity } = stockProduct[i];
        cart_product_count = buy_product_item + quantity;
        buy_product_item = buy_product_item + quantity;
        const { price, discount } = stockProduct[i].products[0];

        if (discount !== 0) {
          calculated_price =
            calculated_price +
            quantity * (price - Math.floor((price * discount) / 100));
        } else {
          calculated_price = calculated_price + quantity * price;
        }
      }

      let p = [];
      let unique = [
        ...new Set(stockProduct.map((p) => p.products[0].sellerId.toString())),
      ];

      for (let i = 0; i < unique.length; i++) {
        let price = 0;
        for (let j = 0; j < stockProduct.length; j++) {
          const tempProduct = stockProduct[j].products[0];
          if (unique[i] === tempProduct.sellerId.toString()) {
            let pric = 0;
            if (tempProduct.discount !== 0) {
              pric =
                tempProduct.price -
                Math.floor((tempProduct.price * tempProduct.discount) / 100);
            } else {
              pric = tempProduct.price;
            }
            pric = pric - Math.floor((pric * commission) / 100);
            price = price + pric * stockProduct[j].quantity;
            p[i] = {
              sellerId: unique[i],
              shopName: tempProduct.shopName,
              price,
              products: p[i]
                ? [
                    ...p[i].products,
                    {
                      _id: stockProduct[j]._id,
                      quantity: stockProduct[j].quantity,
                      productInfo: tempProduct,
                    },
                  ]
                : [
                    {
                      _id: stockProduct[j]._id,
                      quantity: stockProduct[j].quantity,
                      productInfo: tempProduct,
                    },
                  ],
            };
          }
        }
      }

      responseReturn(res, 200, {
        cart_products: p,
        price: calculated_price,
        cart_product_count,
        shipping_fee: 20 * p.length,
        buy_product_item,
        outofstock,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //

  delete_cart_product = async (req, res) => {
    const { cartId } = req.params;
    try {
      await cartModel.findByIdAndDelete(cartId);
      responseReturn(res, 200, { message: "Product Removed Successfully" });
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  get_wishlist = async (req, res) => {
    const { userId } = req.params;
    try {
      const wishlist = await wishlistModel.find({ userId });
      responseReturn(res, 200, { wishlistCount: wishlist.length, wishlist });
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  add_to_wishlist = async (req, res) => {
    const { product, userId } = req.body;
    const { _id, name, slug, price, discount, images, rating } = product;
    try {
      const product = await wishlistModel.findOne({ slug });
      if (product) {
        responseReturn(res, 400, { error: "Product Already In Wishlist" });
      } else {
        await wishlistModel.create({
          userId,
          ProductId: _id,
          name,
          slug,
          price,
          discount,
          images,
          rating,
        });
        responseReturn(res, 201, { message: "Product Added In Wishlist" });
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  //
  quantity_increment = async (req, res) => {
    const { cartId } = req.params;
    try {
      const product = await cartModel.findById(cartId);
      const { quantity } = product;

      await cartModel.findByIdAndUpdate(cartId, { quantity: quantity + 1 });
      responseReturn(res, 200, { message: " Quantity Updated Successfully" });
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  quantity_decrement = async (req, res) => {
    const { cartId } = req.params;
    try {
      const product = await cartModel.findById(cartId);
      const { quantity } = product;

      await cartModel.findByIdAndUpdate(cartId, { quantity: quantity - 1 });
      responseReturn(res, 200, { message: " Quantity Updated Successfully" });
    } catch (error) {
      console.log(error.message);
    }
  };

  //
  delete_wishlist = async (req, res) => {
    const { wishlistId } = req.params;
    try {
      const wishlist = await wishlistModel.findByIdAndDelete(wishlistId);
      responseReturn(res, 200, {
        message: "Product Removed Successfully",
        wishlist,
        wishlistId,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  //
}

module.exports = new cartController();
