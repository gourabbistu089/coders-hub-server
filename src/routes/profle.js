const express = require("express");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();
const { useAuth } = require("../middleware/auth");
const User = require("../models/user.model");
const { validateProfileData } = require("../utils/validation");
const { upload } = require("../middleware/multer");
const { uploadOnCloudinary } = require("../utils/cloudinary");

profileRouter.get("/profile/view", useAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.log("Error in " + error.message);
    res.json({
      success: false,
      message: error.message,
    });
  }
});

// edit userProfile by id
profileRouter.patch("/profile/edit", useAuth, async (req, res) => {
  try {
    const isValidUpdate = validateProfileData(req);
    if (!isValidUpdate) {
     throw new Error("Invalid Edit Request")
    }
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res
        .status(400)
        .json({ success: false, message: "User  is not Login to System" });
    }
   

    const updatedUser = await User.findByIdAndUpdate(loggedInUser._id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});
// change password 
profileRouter.patch("/profile/update-password", useAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      return res
        .status(400)
        .json({ success: false, message: "User  is not Login to System" });
    }
   
    let userPassword = req.body.password;
    userPassword = await bcrypt.hash(userPassword, 10);
    console.log("userPassword", userPassword);
    const isPasswordValid = await loggedInUser.validatePassword(userPassword);
    console.log("isPasswordValid", isPasswordValid);
    if (isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Same password is not allowed" });
    }

   loggedInUser.password = userPassword;
    const updatedUser = await loggedInUser.save();

    return res.json({
      success: true,
      data: updatedUser,
      message: "User Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

// delete user by id
profileRouter.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  console.log("userId", userId);
  try {
    const user = await User.findOneAndDelete({ _id: userId }); // ✅ Corrected query
    console.log(user);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      data: user,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleting user");
    res.status(500).json({
      success: false,
      message: "Error in deleting user",
      error: error.message,
    });
  }
});


// update user by id
profileRouter.put("/user", async (req, res) => {
  const userId = req.body.userId;
  console.log("userId", userId);
  try {
    const user = await User.findByIdAndUpdate({ _id: userId }, req.body, {
      returnDocument: "after",
    }); // 3rd paramter is options go to docs
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,
      data: user,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleting user");
    res.status(500).json({
      success: false,
      message: "Error in deleting user",
      error: error.message,
    });
  }
});

profileRouter.post('/profile/updatePhotoUrl', upload.single('image'), useAuth, async (req, res) => {
  const loggedInUser = req.user;
  console.log("loggedInUser", loggedInUser);
  if (!loggedInUser) {
    return res
      .status(400)
      .json({ success: false, message: "User  is not Login to System" });
  }
  try {
    const imageLocalPath = req.file?.path;
    console.log("imageLocalPath", imageLocalPath);
    if (!imageLocalPath) {
      return res.status(400).json({ success: false, message: "Image is not found" });
    }
    const imageRemoteUrl  = await uploadOnCloudinary(imageLocalPath);
    loggedInUser.photoUrl = imageRemoteUrl.secure_url;
    const updatedUser = await loggedInUser.save();
    return res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.log("Error in updating image", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
})


// Feed api a- get all users
profileRouter.get("/users", async (req, res) => {
  try {
  } catch (error) {}
});

module.exports = profileRouter;
