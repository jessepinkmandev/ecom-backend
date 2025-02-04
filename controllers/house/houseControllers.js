const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utilities/response");
const queryProducts = require("../../utilities/queryProducts");

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
}
module.exports = new houseControllers();
