const express = require("express");
const User = require("../models/user.model");
const { validateSignUpData } = require("../utils/validation");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

authRouter.post("/signup", async (req, res) => {
  try {
    // validate of data

    validateSignUpData(req);
    const { firstname, lastname, email, password } = req.body;
    //  if already is user
    const existingUser = await User.findOne({ email: email });
    // console.log("User is ", user);
    if (existingUser) {
      throw new Error("User is already registerd ");
    }
    // Encrypt the password
    const hashedPassword = await bcrypt.hash(password, 10);
    //  console.log(hashedPassword)
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    await user.save();
    const token = await user.getJWT();
    // console.log("token", token);
    res.status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "none",
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7), // 7 days
    })
    .json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.log("Error in creating user", error.message);
    res.status(500).json({
      success: false,
      message: "Error in creating user",
      error: error.message,
    });
  }
});
authRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid Credentials");
    }
    const token = await user.getJWT();
    // console.log("token", token);
    res.status(200)
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      // sameSite: "none",
      expires: new Date(Date.now() + 60 * 60 * 1000 * 24 * 7), // 7 days
    })
    .json({
      success: true,
      message: "User Login Successful",
      data: user,
    });
  
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});
authRouter.post("/signout", async (req, res) => {
  try {
    res
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({
        success: true,
        message: "User Logout Successful",
      });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = authRouter;
