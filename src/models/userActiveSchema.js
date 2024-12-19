const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const userActiveSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
  },

  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: String,
    default: Date.now(),
  },
});

const userActiveModal = mongoose.model("userActiveSchema", userActiveSchema);

module.exports = userActiveModal;
