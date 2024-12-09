const express = require("express");

const test2 = express();

const {adminAuth} = require("./middlewares/auth");

//Handle Auth Middleware for ALL requests
test2.use("/admin" , adminAuth)

test2.get("/admin/getAllData", (req, res) => {
  res.send("All Data Sent");
});

test2.get("/admin/deleteUser", (req, res) => {
  res.send("Deleted a user");
});

test2.listen(1000, () => {
  console.log("Server is successfully running on port 1000 ");
});
