const jwt = require("jsonwebtoken");

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;
  // console.log(accessToken);

  if (!accessToken) {
    console.log("no token");
    return res.status(409).json({ error: "Please login first" });
  } else {
    try {
      const decodeToken = await jwt.verify(accessToken, process.env.SECRET);
      req.role = decodeToken.role;
      req.id = decodeToken.id;
      // console.log(req.id);

      next();
    } catch (error) {
      return res.status(409).json({ error: "Please login first" });
    }
  }
};
