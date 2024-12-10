const jwt = require("jsonwebtoken");
const User = require("../models/user");

const adminAuth = (req, res, next) => {
  console.log("Admin auth is getting checked !!! ");
  // Logic to check if request  is authenticated
  const token = "xyz";
  const isAdminAuthorised = token === "xyz";
  if (!isAdminAuthorised) {
    res.status(401).send("Invalid Request access ");
  } else {
    next();
  }
};

const userAuth = async (req, res, next) => {
  // steps to implement auth middleware
  // 1.check the req auth header if key is present or not
  //3. if key is present - extract the bearer token and verify the hash signature
  //4. if hash sign is valid , then process witth next()

  let token = req.headers.authorization
    ? req.headers.authorization.split(" ")[1]
    : "";

  console.log("Incoming Token ====>>>>>", token);

  try {
    const secretKey = "your_secret_key";
    const verifyToken = jwt.verify(token, secretKey);
    console.log(
      "Token verify ===========================",
      verifyToken.emailId
    );
    let user =await User.findOne({ emailId: verifyToken.emailId });
    console.log("user", user);
    req.user = user
    next();
  } catch (error) {
    console.log("error ========", error.name);
    res.json({ error: error.message });
  }
};

module.exports = {
  adminAuth,
  userAuth,
};
