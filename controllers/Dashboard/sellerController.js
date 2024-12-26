const { responseReturn } = require("../../utilities/response");
const sellerModel = require("../../models/sellerModel");

class sellerController {
  get_seller = async (req, res) => {
    const { sellerId } = req.params;

    try {
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 200, { seller });
    } catch (error) {
      responseReturn(res, 200, { error: error.message });
    }
  };

  request_seller_get = async (req, res) => {
    const { page, search, perPage } = req.query;
    // console.log(req.query);
    let skipPage;
    skipPage = parseInt(perPage) * (parseInt(page) - 1);

    try {
      if (search) {
      } else {
        const sellers = await sellerModel
          .find({ status: "pending" })
          .skip(skipPage)
          .limit(perPage)
          .sort({ createdAt: -1 });

        const totalSeller = await sellerModel
          .find({ status: "pending" })
          .countDocuments();
        responseReturn(res, 200, { sellers, totalSeller });
      }
    } catch (error) {
      responseReturn(res, 500, { error: error.message });
    }
  };

  seller_status_update = async (req, res) => {
    const { sellerId, status } = req.body;
    try {
      await sellerModel.findByIdAndUpdate(sellerId, { status });
      const seller = await sellerModel.findById(sellerId);
      responseReturn(res, 200, {
        seller,
        message: "Seller status updated successfully",
      });
    } catch (error) {}
  };
}

module.exports = new sellerController();