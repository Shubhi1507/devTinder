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

const userAuth = (req, res, next) => {
    // steps to implement auth middleware
    // 1.check the req auth header if key is present or not
    //2. if no key , error - aunauthorise
    //3. if key is present - extract the bearer token and verify the hash signature
    //4. if hash sign is valid , then process witth next()
    //5. if hash sign is invalid , give error - invalid token

  };

module.exports = {
  adminAuth,
  userAuth
};
