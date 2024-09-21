const express = require("express");

const app = express(); //creates new app of express js

//to handle the request code (request handler)

app.use( "/test", (req, res) => {
  res.send("Hello there !!! ");
});

app.use( "/hello", (req, res) => {
    res.send("Hellooo how are you !!! ");
  });

app.listen(1515, () => {
  console.log("Server is listening on port 1515 ...");
});
