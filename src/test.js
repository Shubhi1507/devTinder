const express = require("express");

const test = express();
const {userAuth } = require("./middlewares/auth")
//  1st WAY
// test.use(
//   "/user",
//   (req, res, next) => {
//     console.log("Handling the route user !!");
//     next();
//     res.send("Response !!");
//   },
//   (req, res) => {
//     console.log("Handling the rout user 2 !!");
//     res.send("2 Response !!");

//   }
// );

//2nd Way

test.get("/user", (req, res, next) => {
  console.log("Handling the route user !!");
  next();
});

test.get("/user", (req, res, next) => {
  console.log("Handling the route user 2 !!!");
  res.send("2nd Route Handler");
});

test.listen(7777, () => {
  console.log("Server is successfully running on port 7777 ... ");
});
