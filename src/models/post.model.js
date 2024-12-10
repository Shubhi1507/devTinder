const { type } = require("express/lib/response");
const mongoose = require("mongoose");
const User = require("./user");

const postSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
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

    createdBy: {
      // type: mongoose.Schema.ObjectId,
      // ref: "User",
      // required: true,
      type: String,
      required:true
    },

    createdAt: {
      type: Date,
      default: Date.now(),
    },

    updatedAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

//created user model
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
