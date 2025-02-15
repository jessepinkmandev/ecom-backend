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
    origin: ["http://localhost:5173"],
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
const addUser = (customerId, socketId, userInfo) => {
  const checkUser = allCustomer.some((u) => u.customerId === customerId);
  if (!checkUser) {
    allCustomer.push({ customerId, socketId, userInfo });
  } else {
  }
};

io.on("connection", (soc) => {
  console.log("socket running");

  soc.on("add_user", (customerId, userInfo) => {
    addUser(customerId, soc.id, userInfo);
    // console.log(allCustomer);
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
