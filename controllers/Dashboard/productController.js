const formidable = require("formidable");
const cloudinary = require("cloudinary").v2;
const { responseReturn } = require("../../utilities/response");
const productModel = require("../../models/productModel");

class productController {
  add_product = async (req, res) => {
    const { id } = req;
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      let {
        name,
        description,
        discount,
        price,
        brand,
        stock,
        shopName,
        category,
      } = field;

      let { images } = files;

      name = name.trim();
      const slug = name.split(" ").join("-");

      cloudinary.config({
        cloud_name: process.env.cloud_name,
        api_key: process.env.api_key,
        api_secret: process.env.api_secret,
        secure: true,
      });

      try {
        let allImageUrl = [];
        for (let i = 0; i < images.length; i++) {
          const result = await cloudinary.uploader.upload(images[i].filepath, {
            folder: "products",
          });
          allImageUrl = [...allImageUrl, result.url];
        }
        await productModel.create({
          sellerId: id,
          name,
          slug,
          shopName,
          category: category.trim(),
          description: description.trim(),
          stock: parseInt(stock),
          price: parseInt(price),
          discount: parseInt(discount),
          images: allImageUrl,
          brand: brand.trim(),
        });
        responseReturn(res, 201, { message: "Product Added successfully" });
      } catch (error) {
        responseReturn(res, 500, { error: error.message });
      }
    });
  };

  ////////////////////////////////////////
  get_product = async (req, res) => {
    const { id } = req;
    const { page, perPage, search } = req.query;
    let skipPage;

    skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      if (search && page && perPage) {
        const products = await productModel
          .find({
            $text: { $search: search },
            sellerId: id,
          })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalProduct = await productModel
          .find({
            $text: { $search: search },
            sellerId: id,
          })
          .countDocuments();
        responseReturn(res, 200, { products, totalProduct });
      } else {
        const products = await productModel
          .find({ sellerId: id })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalProduct = await productModel
          .find({ sellerId: id })
          .countDocuments();
        responseReturn(res, 200, { products, totalProduct });
      }
    } catch (error) {
      console.log(error);
    }
  };

  ////////////////
  get_productone = async (req, res) => {
    const { productId } = req.params;

    try {
      const product = await productModel.findById(productId);
      responseReturn(res, 200, { product });
    } catch (error) {
      console.log(error);
    }
  };

  ///////////////////
  update_product = async (req, res) => {
    let {
      name,
      description,
      discount,
      price,
      brand,
      stock,
      category,
      productId,
    } = req.body;

    name = name.trim();
    const slug = name.split(" ").join("-");

    try {
      await productModel.findByIdAndUpdate(productId, {
        name,
        description,
        discount,
        price,
        brand,
        stock,
        category,
        productId,
        slug,
      });

      const product = await productModel.findById(productId);
      responseReturn(res, 201, {
        product,
        message: "Product Updated successfully",
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: error.message,
      });
    }
  };

  ////
  product_image_update = async (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, field, files) => {
      const { oldImage, productId } = field;
      const { newImage } = files;

      if (err) {
        responseReturn(res, 400, {
          error: err.message,
        });
      } else {
        try {
          cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret,
            secure: true,
          });

          const result = await cloudinary.uploader.upload(newImage.filepath, {
            folder: "products",
          });

          if (result) {
            let { images } = await productModel.findById(productId);
            const index = images.findIndex((img) => img === oldImage);
            images[index] = result.url;
            await productModel.findByIdAndUpdate(productId, { images });

            const product = await productModel.findById(productId);
            responseReturn(res, 200, {
              product,
              message: "Product Image Added successfully",
            });
          } else {
            responseReturn(res, 400, {
              error: "Product Image Update Failed ",
            });
          }
        } catch (error) {
          responseReturn(res, 400, {
            error: error.message,
          });
        }
      }
    });
  };
}

module.exports = new productController();
