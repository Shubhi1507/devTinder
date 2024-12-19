const express = require("express");
const connectDB = require("./config/database");
const bcrypt = require("bcrypt");
const app = express(); //creates new app of express js
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const Post = require("./models/post.model");
const { v4: uuidv4 } = require("uuid");
const { userAuth } = require("./middlewares/auth");
const crypto = require("crypto");
const userActiveModal = require("./models/userActiveSchema");

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
// Generate OTP

app.post("/generate-otp", async (req, res) => {
  try {
    //1. take email from user and handle case if user doesnt provide email
    const email = req.body.emailId;
    if (!email) {
      return res.json({ error: "Please provide email id " });
    }
    //2. cross check the email from DB , if not found then throw error
    const checkEmailfromDB = await User.findOne({ emailId: email });
    if (!checkEmailfromDB) {
      return res.json({ error: "Email does not exist in our DataBase" });
    }
    // save the email and generated OTP in DB
    const generateOTP = crypto.randomInt(100000, 999999);
    console.log(generateOTP);
    const newUserActiveInstance = new userActiveModal({
      emailId: email,
      otp: generateOTP,
    });
    await newUserActiveInstance.save();
    res.json({ message: "OTP generated successfully", otp: generateOTP });
  } catch (error) {
    res.status(400).send("Something went wrong");
  }
});

// VERFY the OTP
app.put("/verify-otp", async (req, res) => {
  const email = req.body.emailId;
  const otp = req.body.otp;
  if (!email || !otp || otp.length != 6) {
    return res.send({ error: " User Input is invalid" });
  }

  try {
    let userFound = await userActiveModal.findOneAndDelete({
      emailId: email,
      otp: otp,
    });
    console.log(userFound);
    if (!userFound) {
      return res.json({ error: "either email or otp is incorrect" });
    }
    let user = await User.findOneAndUpdate(
      { emailId: email },
      { $set: { isActive: true } }
    );
    res.json({ message:"Account activated succesfully" });
  } catch (error) {
    res.status(400).send("Something went wrong");
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

app.post("/login", async (req, res) => {
  if (!req.body.emailId || !req.body.password) {
    return res.json({ error: "Email id or password  is missing" });
  } else {
    const email = req.body.emailId;
    const isFound = await User.find({ emailId: email });
    if (isFound.length > 0) {
      const isActiveFlag = isFound[0].isActive;
      if (!isActiveFlag) {
        return res.json({ error: "User is Disabled" });
      }
      const userPassword = req.body.password;
      const dbPassword = isFound[0].password;
      let result = await bcrypt.compare(userPassword, dbPassword);

      if (!result) {
        return res.json({ error: "Password does not match" });
      } else {
        // res.json({ message: "User has been logged in successfully " });

        const payload = { emailId: email };
        const secretKey = "your_secret_key";
        const options = { expiresIn: "24h" }; // Token expires in 1 hour
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

app.put("/delete-user", [userAuth], async (req, res) => {
  const email = req.user.emailId;

  try {
    const deleteUser = await User.findOneAndUpdate(
      { emailId: email },
      { $set: { isActive: false } }
    );
    res.json({ message: "User deleted successfully" });
  } catch (error) {
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
