const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://shubhisingh:zY5V1R5CGwFPut07@nodeproject.utuat.mongodb.net/devTinder"
  ); // connects to the cluster
};

module.exports = connectDB;
