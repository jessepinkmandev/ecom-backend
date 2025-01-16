const categoryModel = require("../../models/categoryModel");
const productModel = require("../../models/productModel");
const { responseReturn } = require("../../utilities/response");

class houseControllers {
  formateProduct = (products) => {
    const productArray = [];
    let i = 0;
    while (i < products.length) {
      let temp = [];
      let j = i;
      while (j < i + 3) {
        if (products[j]) {
          temp.push[products[j]];
        }
        j++;
      }
      productArray.push([...temp]);
      i = j;
    }
    return productArray;
  };

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

  get_products = async (req, res) => {
    try {
      const products = await productModel.find({}).sort({
        createdAt: -1,
      });
      const allProducts = await productModel.find({}).limit(3).sort({
        createdAt: -1,
      });
      const latestProducts = this.formateProduct(allProducts);

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
        latestProducts,
        topRatedProducts,
        discountProducts,
      });
    } catch (error) {
      console.log(error.message);
    }
  };
}
module.exports = new houseControllers();
