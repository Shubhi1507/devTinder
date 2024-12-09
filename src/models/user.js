const mongoose = require("mongoose");
const validator = require("validator")
//defined schema which tells users connection and data
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    lowercase: true,
    required: true,
    unique: true,
    trim: true,
    validate(value) {
if(!validator.isEmail(value)){
 throw new Error("Invalid email address" + value) 
}
    }
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: String,
  },
  gender: {
    type: String,
    validate(value) {
      if (!["male", "female", "others"].includes(value)) {
        throw new Error("Gender data is not valid");
      }
    },
  },
  skills: {
    type: { String },
  },
},
{
  timestamps:true,
}
);

//created user model
const User = mongoose.model("User", userSchema);

module.exports = User;
