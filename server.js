const express = require("express");
const app = express();

require("dotenv").config();

const port = process.env.PORT;
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./utilities/db");

dbConnect();

const socket = require("socket.io");

const http = require("http");
const { userInfo } = require("os");
const server = http.createServer(app);

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

const io = socket(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

var allCustomer = [];
var allSeller = [];
let admin = {};

const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomer.some((u) => u.customerId === customerId);
  if (!checkUser) {
    allCustomer.push({ customerId, socketId, userInfo });
  }
};

const addSeller = (sellerId, socketId, userInfo) => {
  const checkSeller = allSeller.some((u) => u.sellerId === sellerId);
  if (!checkSeller) {
    allSeller.push({ sellerId, socketId, userInfo });
  }
};

const findCustomer = (customerId) => {
  return allCustomer.find((c) => c.customerId === customerId);
};
const findSeller = (sellerId) => {
  return allSeller.find((c) => c.sellerId === sellerId);
};

const remove = (socketId) => {
  allCustomer = allCustomer.filter((c) => c.socketId !== socketId);
  allSeller = allSeller.filter((c) => c.socketId !== socketId);
};

io.on("connection", (soc) => {
  console.log("socket running");

  soc.on("add_user", (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo);
    // console.log(allCustomer);
    io.emit("activeSeller", allSeller);
  });
  soc.on("add_seller", (sellerId, userInfo) => {
    addSeller(sellerId, soc.id, userInfo);
    // console.log(userInfo);
    io.emit("activeSeller", allSeller);
  });
  soc.on("send_seller_message", (msg) => {
    const customer = findCustomer(msg.receiverId);
    if (customer !== undefined) {
      soc.to(customer.socketId).emit("seller_message", msg);
    }
  });
  soc.on("send_customer_message", (msg) => {
    const seller = findSeller(msg.receiverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("customer_message", msg);
    }
  });

  soc.on("send_admin_to_seller_message", (msg) => {
    const seller = findSeller(msg.receiverId);
    if (seller !== undefined) {
      soc.to(seller.socketId).emit("receive_admin_message", msg);
    }
  });

  soc.on("send_seller_to_admin_message", (msg) => {
    if (admin) {
      soc.to(admin.socketId).emit("receive_seller_message", msg);
    }
  });

  soc.on("add_admin", (adminInfo) => {
    delete adminInfo.email;
    delete adminInfo.password;
    C = adminInfo;
    admin.socketId = soc.id;
    io.emit("activeSeller", allSeller);
  });

  soc.on("disconnect", () => {
    // console.log("user disconnected");
    remove(soc.id);
    io.emit("activeSeller", allSeller);
  });
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api/home", require("./routes/House/houseRoutes"));
app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/Dashboard/categoryRoutes"));
app.use("/api", require("./routes/Dashboard/productRoutes"));
app.use("/api", require("./routes/Dashboard/sellerRoutes"));
app.use("/api", require("./routes/chatRoutes"));
app.use("/api", require("./routes/House/customerAuthRoute"));
app.use("/api", require("./routes/House/cartRoutes"));
app.use("/api", require("./routes/Order/orderRoutes"));

app.get("/", (req, res) => res.send("My Backend"));

server.listen(port, () => console.log(`server running  on ${port}`));
