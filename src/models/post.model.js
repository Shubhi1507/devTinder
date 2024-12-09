const { type } = require("express/lib/response");
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    postId:{
      type:String ,
      required:true
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//created user model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
