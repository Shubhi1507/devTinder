const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");
const app = express(); //creates new app of express js
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const Post = require("./models/post.model");
const { v4: uuidv4 } = require("uuid");
const { userAuth } = require("./middlewares/auth");

app.use(express.json()); //it works for all the routes automatically

app.get("/", [userAuth], async (req, res) => {
  console.log("req.user", req.user);
  res.send("ok");
});
//POST CREATED
app.post("/create", [userAuth], async (req, res) => {
  console.log(req.user);
  const post = new Post({
    ...req.body,
    postId: uuidv4(),
    createdBy: req.user.emailId,
  });
  try {
    await post.save();
    res.send("Post has been created");
  } catch (error) {
    res.status(400).send("Error saving the user :" + error.message);
  }
});
//GET ALL THE POST
app.get("/getposts", async (req, res) => {
  try {
    const allposts = await Post.find({});
    res.json({ message: "success", data: allposts });
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
});

//   const postId = req.body.postId;
//   console.log("postID", postId);
//   if(!postId){
//     res.send({error:"Post Id required"})
//   }
//   try {
//      await User.findByIdAndDelete(postId);
//     res.send("User deleted successfully");
//   } catch (err) {
//     res.status(400).send("Something went wrong");
//   }
// });

// app.patch("/updateuser", async (req, res) => {
//   const postId = req.res?.postId;
//   const data = req.body;``````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
//   if(!postId){
// res.send({error:"Post ID is Required"})
//   }

//   try {
//     const ALLOWED_UPDATES = ["title", "body", "image" ];

//     const isUpdateAllowed = Object.keys(data).every((k) =>
//       ALLOWED_UPDATES.includes(k)
//     );

//     if (!isUpdateAllowed) {
//       throw new Error("Update not allowed");
//     }
//     await Post.findByIdAndUpdate({ postId: postId }, data);

//     res.send("User updated succesfull");
//   } catch (error) {
//     res.status(400).send("Something went wrong");
//   }
// });

/////////////////////////////////////////////////////////////////

app.post("/login", async (req, res) => {
  if (!req.body.emailId || !req.body.password) {
    return res.json({ error: "Email id or password  is missing" });
  } else {
    const email = req.body.emailId;
    const isFound = await User.find({ emailId: email });
    if (isFound.length > 0) {
      const userPassword = req.body.password;
      const dbPassword = isFound[0].password;
      let result = await bcrypt.compare(userPassword, dbPassword);

      if (!result) {
        res.json({ error: "Password does not match" });
      } else {
        // res.json({ message: "User has been logged in successfully " });

        const payload = { emailId: email };
        const secretKey = "your_secret_key";
        const options = { expiresIn: "1d" }; // Token expires in 1 hour
        const token = jwt.sign(payload, secretKey, options);
        req.user = isFound[0];
        res.json({ token: token, message: "Success", data: isFound[0] });
      }
    } else {
      res.json({ message: "User NOT found" });
    }
  }
});

app.post("/signup", async (req, res) => {
  // Creating a new instance of the user model
  try {
    const newPassword = await bcrypt.hash(req.body.password, 10);
    req.body.password = newPassword;
    const user = new User(req.body);
    console.log(user, newPassword);
    await user.save();
    res.send("User added successfully !!");
  } catch (err) {
    res.status(400).send("Error saving the user :" + err.message);
  }
});
// FEED API - GET/feed get all the users from DB
app.get("/feed", [userAuth], async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

//Delete User API

app.delete("/user", [userAuth], async (req, res) => {
  const userId = req.body.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

// delete post
app.delete("/delete-posts", [userAuth], async (req, res) => {
  const postId = req.body.postId;
  console.log("post id ++++++++++++++++", postId);
  if (!postId) {
    res.json({ error: "Post ID is missing " });
  }
  try {
    let userEmail = req.user.emailId;
    const post = await Post.findOne({ postId });
    if (userEmail == post.createdBy) {
      await Post.deleteOne({ postId });
      res.json({ message: "Post deleted successfully" });
    } else {
      res.json({ error: "User does not have require permission to DELETE " });
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

//Update POST

app.post("/post/:postId", [userAuth], async (req, res) => {
  const postId = req.params.postId;
  if (!postId) {
    res.json({ error: "Post ID is missing " });
  }
  const postData = req.body;

  if (Object.keys(postData).length == 0) {
    res.json({ error: "Body of the request is missing " });
  }
  try {
    const doesPostExist = await Post.findOne({ postId });
    console.log("does post exist...", doesPostExist, postData);
    if (doesPostExist) {
      let userEmail = req.user.emailId;
      let createdByPost = doesPostExist.createdBy;
      if (userEmail == createdByPost) {
        const post = await Post.findOneAndUpdate(
          { postId },
          { $set: postData }
        );
        console.log("OK POST CHECK", post);
        res.json({ message: "post updated succesfully" });
      } else {
        res.json({ error: "USER is different " });
      }
    } else {
      res.status(400).json({ error: "No post found" });
    }
  } catch (error) {
    res.status(400).send("Something went wrong");
    console.log(error);
  }
});

//Update the data of the user

app.patch("/user", [userAuth], async (req, res) => {
  const userId = req.params?.userId;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }
    await User.findByIdAndUpdate({ _id: userId }, data);
    4;
    res.send("User updated succesfull");
  } catch (err) {
    res.status(400).send("Something went wrong");
  }
});

//Change User Password

app.put("/update-password", [userAuth], async (req, res) => {
  const { emailId, oldPassword, newPassword } = req.body;

  const userData = await User.findOne({ emailId });

  const dbPasswordUser = userData.password;
  const isOldPasswordValid = await bcrypt.compare(oldPassword, dbPasswordUser);

  if (!isOldPasswordValid) {
    res.json({ error: " Old Password does not match" });
  } else {
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    userData.password = newHashedPassword;
    await userData.save();
    res.json({ message: "Password updated successfully " });
  }
});

connectDB()
  .then(() => {
    console.log("Database connection established ");
    app.listen(9999, () => {
      console.log("Server is listening on port 9999 ...");
    });
  })
  .catch((err) => {
    console.log("Database can not be connected");
    console.log(err);
  });
