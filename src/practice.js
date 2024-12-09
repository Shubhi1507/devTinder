const express = require("express");

const app = express(); //creates new app of express js

const adminAuth = require("./middlewares");

//to handle the request code (request handler)

app.get("/user", (req, res) => {
  res.send({ firstName: "Shubhi ", lastName: "Singh " });
}); //this will only handle GET call to /user

app.post("/test", (req, res) => {
  res.send("Data successfully saved to the database");
}); //this will only handle POST call to /test

app.delete("/delete", (req, res) => {
  res.send("User deleted successfully !!!");
}); //This will handle all the DELETE  API calls to /delete

app.use("/ok", (req, res) => {
  res.send("OK OK OK OK OK OK ");
}); //This will match all the HTTP methods API calls to /test

app.listen(1515, () => {
  console.log("Server is listening on port 1515 ...");
});
