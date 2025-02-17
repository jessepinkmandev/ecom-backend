const sellerCustomerModel = require("../../models/chat/sellerCustomerModel");
const sellerCustomerMessage = require("../../models/chat/sellerCustomerMessage");
const customerModel = require("../../models/customerModel");
const sellerModel = require("../../models/sellerModel");
const adminSellerMessage = require("../../models/chat/adminSellerMessage");
const { responseReturn } = require("../../utilities/response");

class chatController {
  add_friend = async (req, res) => {
    const { sellerId, userId } = req.body;

    if (sellerId === userId) {
      return responseReturn(res, 400, {
        message: "You cannot add yourself as a friend.",
      });
    }

    try {
      if (sellerId !== "") {
        const seller = await sellerModel.findById(sellerId);
        const user = await customerModel.findById(userId);
        const checkSeller = await sellerCustomerModel.findOne({
          myId: userId,
          "myFriends.fdId": sellerId,
        });
        if (!checkSeller) {
          await sellerCustomerModel.updateOne(
            {
              myId: userId,
            },
            {
              $addToSet: {
                myFriends: {
                  fdId: sellerId,
                  name: seller.shopInfo?.shopName,
                  image: seller.image,
                },
              },
            }
          );
        }

        const checkCustomer = await sellerCustomerModel.findOne({
          myId: sellerId,
          "myFriends.fdId": userId,
        });
        if (!checkCustomer) {
          await sellerCustomerModel.updateOne(
            {
              myId: sellerId,
            },
            {
              $addToSet: {
                myFriends: {
                  fdId: userId,
                  name: user.name,
                  image: "",
                },
              },
            }
          );
        }
        const messages = await sellerCustomerMessage.find({
          $or: [
            {
              $and: [
                { receiverId: { $eq: sellerId } },
                { senderId: { $eq: userId } },
              ],
            },
            {
              $and: [
                { receiverId: { $eq: userId } },
                { senderId: { $eq: sellerId } },
              ],
            },
          ],
        });
        const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
        const currentFriend = MyFriends.myFriends.find(
          (s) => s.fdId === sellerId
        );
        responseReturn(res, 200, {
          MyFriends: MyFriends.myFriends,
          currentFriend,
          messages,
        });
      } else {
        const MyFriends = await sellerCustomerModel.findOne({ myId: userId });
        responseReturn(res, 200, { MyFriends: MyFriends.myFriends });
      }
    } catch (error) {
      console.log(error);
    }
  };

  ///////////////////
  //
  send_message = async (req, res) => {
    const { userId, text, sellerId, name } = req.body;

    try {
      const message = await sellerCustomerMessage.create({
        senderId: userId,
        senderName: name,
        receiverId: sellerId,
        message: text,
      });

      const data = await sellerCustomerModel.findOne({ myId: userId });

      let myFriends = data.myFriends;
      let index = myFriends.findIndex((f) => f.fdId === sellerId);

      while (index > 0) {
        let temp = myFriends[index];
        myFriends[index] = myFriends[index - 1];
        myFriends[index - 1] = temp;
        index--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: userId,
        },
        { myFriends }
      );

      //

      const data1 = await sellerCustomerModel.findOne({ myId: sellerId });

      let myFriends1 = data.myFriends;
      let index1 = myFriends1.findIndex((f) => f.fdId === userId);

      while (index > 0) {
        let temp1 = myFriends1[index1];
        myFriends1[index1] = myFriends[index1 - 1];
        myFriends1[index1 - 1] = temp1;
        index1--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: sellerId,
        },
        { myFriends }
      );
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error.message);
    }
  };
  //
  get_customers = async (req, res) => {
    const { sellerId } = req.params;
    //   console.log(sellerId);
    try {
      const data = await sellerCustomerModel.findOne({ myId: sellerId });
      // console.log(data);
      responseReturn(res, 200, { customers: data.myFriends });
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  get_sellers = async (req, res) => {
    try {
      const sellers = await sellerModel.find({});
      // console.log(data);
      responseReturn(res, 200, { sellers });
    } catch (error) {
      console.log(error.message);
    }
  };
  //

  get_customer_message = async (req, res) => {
    const { customerId } = req.params;
    const { id } = req;
    try {
      const messages = await sellerCustomerMessage.find({
        $or: [
          {
            $and: [
              { receiverId: { $eq: customerId } },
              { senderId: { $eq: id } },
            ],
          },
          {
            $and: [
              { receiverId: { $eq: id } },
              { senderId: { $eq: customerId } },
            ],
          },
        ],
      });
      const currentCustomer = await customerModel.findById(customerId);
      responseReturn(res, 200, { messages, currentCustomer });
    } catch (error) {
      console.log(error.message);
    }
  };

  //

  send_customer_message = async (req, res) => {
    // const { userId, text, sellerId, name } = req.body;
    const { senderId, receiverId, text, name } = req.body;

    try {
      const message = await sellerCustomerMessage.create({
        senderId: senderId,
        senderName: name,
        receiverId: receiverId,
        message: text,
      });

      const data = await sellerCustomerModel.findOne({ myId: senderId });

      let myFriends = data.myFriends;
      let index = myFriends.findIndex((f) => f.fdId === receiverId);

      while (index > 0) {
        let temp = myFriends[index];
        myFriends[index] = myFriends[index - 1];
        myFriends[index - 1] = temp;
        index--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: senderId,
        },
        { myFriends }
      );

      //

      const data1 = await sellerCustomerModel.findOne({ myId: receiverId });

      let myFriends1 = data.myFriends;
      let index1 = myFriends1.findIndex((f) => f.fdId === senderId);

      while (index > 0) {
        let temp1 = myFriends1[index1];
        myFriends1[index1] = myFriends[index1 - 1];
        myFriends1[index1 - 1] = temp1;
        index1--;
      }
      await sellerCustomerModel.updateOne(
        {
          myId: receiverId,
        },
        { myFriends }
      );
      responseReturn(res, 201, { message });
    } catch (error) {
      console.log(error.message);
    }
  };
  ///
  seller_admin_message_insert = async (req, res) => {
    const { senderId, receiverId, message, senderName } = req.body;
    try {
      const messageData = await adminSellerMessage.create({
        senderId,
        receiverId,
        message,
        senderName,
      });
      responseReturn(res, 201, { messageData });
    } catch (error) {
      console.log(error.message);
    }
  };
  //
  get_admin_message = async (req, res) => {
    const { receiverId } = req.params;
    const id = "";

    try {
      const messages = await adminSellerMessage.find({
        $or: [
          {
            $and: [
              {
                receiverId: { $eq: receiverId },
              },
              {
                senderId: {
                  $eq: id,
                },
              },
            ],
          },
          {
            $and: [
              {
                receiverId: { $eq: id },
              },
              {
                senderId: {
                  $eq: receiverId,
                },
              },
            ],
          },
        ],
      });
      let currentSeller = {};
      if (receiverId) {
        currentSeller = await sellerModel.findById(receiverId);
      }
      // console.log(messages);
      responseReturn(res, 200, {
        messages,
        currentSeller,
      });
    } catch (error) {
      console.log(error);
    }
  };
  //
  get_seller_message = async (req, res) => {
    const receiverId = "";
    const { id } = req;

    try {
      const messages = await adminSellerMessage.find({
        $or: [
          {
            $and: [
              {
                receiverId: { $eq: receiverId },
              },
              {
                senderId: {
                  $eq: id,
                },
              },
            ],
          },
          {
            $and: [
              {
                receiverId: { $eq: id },
              },
              {
                senderId: {
                  $eq: receiverId,
                },
              },
            ],
          },
        ],
      });

      // console.log(messages);
      responseReturn(res, 200, { messages });
    } catch (error) {
      console.log(error);
    }
  };

  //
}

module.exports = new chatController();
