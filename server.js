const express = require("express");
const app = express();

require("dotenv").config();

const port = process.env.PORT;
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { dbConnect } = require("./utilities/db");

dbConnect();

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(cookieParser());

app.use("/api", require("./routes/authRoutes"));
app.use("/api", require("./routes/Dashboard/categoryRoutes"));
app.use("/api", require("./routes/Dashboard/productRoutes"));
app.use("/api", require("./routes/Dashboard/sellerRoutes"));

app.get("/", (req, res) => res.send("My Backend"));

app.listen(port, () => console.log(`server running  on ${port}`));
