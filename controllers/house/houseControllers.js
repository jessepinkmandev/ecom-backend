const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const reviewModel = require("../../models/reviewModel");
const { responseReturn } = require("../../utilities/response");
const queryProducts = require("../../utilities/queryProducts");
const moment = require("moment");
const {
  mongo: { ObjectId },
} = require("mongoose");

class houseControllers {
  formateProduct = (products) => {
    const productArray = [];
    let i = 0;
    while (i < products.length) {
      let temp = [];
      let j = i;
      while (j < i + 3) {
        if (products[j]) {
          temp.push(products[j]);
        }
        j++;
      }
      productArray.push([...temp]);
      i = j;
    }
    return productArray;
  };

  //

  get_categorys = async (req, res) => {
    try {
      const categorys = await categoryModel.find({});
      responseReturn(res, 200, {
        categorys,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //
  product_details = async (req, res) => {
    // console.log(req.params);
    const { slug } = req.params;
    try {
      const product = await productModel.findOne({ slug });
      const relatedProduct = await productModel
        .find({
          $and: [
            {
              _id: {
                $ne: product.id,
              },
            },
            {
              category: {
                $eq: product.category,
              },
            },
          ],
        })
        .limit(3);
      const moreProduct = await productModel
        .find({
          $and: [
            {
              _id: {
                $ne: product.id,
              },
            },
            {
              sellerId: {
                $eq: product.sellerId,
              },
            },
          ],
        })
        .limit(3);
      responseReturn(res, 200, { product, relatedProduct, moreProduct });
      // console.log(product);
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  query_products = async (req, res) => {
    const perPage = 3;

    req.query.perPage = perPage;
    // console.log(req.query);

    try {
      const products = await productModel.find({}).sort({
        createdAt: -1,
      });

      const totalProduct = new queryProducts(products, req.query)
        .categoryQuery()
        .ratingQuery()
        .searchQuery()
        .priceQuery()
        .sortByPrice()
        .countProducts();

      const result = new queryProducts(products, req.query)
        .categoryQuery()
        .ratingQuery()
        .priceQuery()
        .searchQuery()
        .sortByPrice()
        // .skip()
        // .limit()
        .getProducts();

      responseReturn(res, 200, {
        products: result,
        totalProduct,
        perPage,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //
  price_range_product = async (req, res) => {
    try {
      const priceRange = {
        low: 0,
        high: 0,
      };
      const products = await productModel.find({}).limit(3).sort({
        createdAt: -1,
      });
      const latest_product = this.formateProduct(products);
      const getForPrice = await productModel.find({}).sort({ price: 1 });

      if (getForPrice.length > 0) {
        priceRange.high = getForPrice[getForPrice.length - 1].price;
        priceRange.low = getForPrice[0].price;
      }
      responseReturn(res, 200, {
        latest_product,
        priceRange,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //

  get_products = async (req, res) => {
    try {
      const products = await productModel.find({}).sort({
        createdAt: -1,
      });
      const allProducts = await productModel.find({}).limit(3).sort({
        createdAt: -1,
      });
      const latest_product = this.formateProduct(allProducts);

      const allProducts2 = await productModel.find({}).limit(3).sort({
        rating: -1,
      });
      const topRatedProducts = this.formateProduct(allProducts2);

      const allProducts3 = await productModel.find({}).limit(3).sort({
        discount: -1,
      });
      const discountProducts = this.formateProduct(allProducts3);

      responseReturn(res, 200, {
        products,
        latest_product,
        topRatedProducts,
        discountProducts,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  //
  //

  get_review = async (req, res) => {
    const { productId } = req.params;
    let { pageNumber } = req.query;

    pageNumber = parseInt(pageNumber);
    const limit = 5;
    const skipPage = limit * (pageNumber - 1);

    try {
      let getRating = await reviewModel.aggregate([
        {
          $match: {
            productId: {
              $eq: new ObjectId(productId),
            },
            rate: {
              $not: { $size: 0 },
            },
          },
        },
        {
          $unwind: "$rate",
        },
        {
          $group: {
            _id: "$rate",
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      let rating_review = [
        {
          rate: 5,
          sum: 0,
        },
        {
          rate: 4,
          sum: 0,
        },
        {
          rate: 3,
          sum: 0,
        },
        {
          rate: 2,
          sum: 0,
        },
        {
          rate: 1,
          sum: 0,
        },
      ];

      for (let i = 0; i < rating_review.length; i++) {
        for (let j = 0; j < getRating.length; j++) {
          if (rating_review[i].rate === getRating[j]._id) {
            rating_review[i].sum = getRating[j].count;
            break;
          }
        }
      }

      const getAll = await reviewModel.find({ productId });
      const reviews = await reviewModel
        .find({ productId })
        .skip(skipPage)
        .limit(limit)
        .sort({ createdAt: -1 });

      responseReturn(res, 200, {
        reviews,
        totalReview: getAll.length,
        rating_review,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  product_review = async (req, res) => {
    const { name, review, rate, productId } = req.body;

    try {
      await reviewModel.create({
        name,
        review,
        rate,
        productId,
        date: moment(Date.now()).format("LL"),
      });
      let rating = 0;
      const reviews = await reviewModel.find({ productId });

      for (let i = 0; i < reviews.length; i++) {
        rating = rating + reviews[i].rate;
      }

      let productRating = 0;
      if (reviews.length !== 0) {
        productRating = (rating / reviews.length).toFixed(1);
      }

      await productModel.findByIdAndUpdate(productId, {
        rating: productRating,
      });

      responseReturn(res, 201, { message: "Review Added Successfully" });
    } catch (error) {
      console.log(error.message);
    }
  }; ///
}
module.exports = new houseControllers();
