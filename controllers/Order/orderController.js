const authOrder = require("../../models/authOrder");
const customerOrder = require("../../models/customerOrder");
const { responseReturn } = require("../../utilities/response");
const moment = require("moment");

class orderController {
  place_order = async (req, res) => {
    const { price, products, shipping_fee, shippingInfo, userId } = req.body;
    let authorOrderData = [];
    let cartId = [];
    const tempDate = moment(Date.now()).format("LLL");
  };
  //

  //
}

module.exports = new orderController();
