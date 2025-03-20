const express = require("express");
const userRouter = express.Router();
const { useAuth } = require("../middleware/auth");
const connectionRequestModel = require("../models/connectionRequest.model");
const User = require("../models/user.model");
const { parse } = require("dotenv");

// Get all the pending connection requests for the logged in user
userRouter.get("/user/requests/received", useAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await connectionRequestModel
      .find({
        receiverId: loggedInUser._id,
        status: "interested",
      })
      .populate("senderId", [
        "firstname",
        "lastname",
        "photoUrl",
        "_id",
        "gender",
        "age",
        "about",
      ]);
    res.json({
      message: "Connection requests fetched successfully",
      success: true,
      data: connectionRequests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userRouter.get("/user/connections", useAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await connectionRequestModel
      .find({
        $or: [
          { senderId: loggedInUser._id, status: "accepted" },
          { receiverId: loggedInUser._id, status: "accepted" },
        ],
      })
      .populate("senderId", [
        "firstname",
        "lastname",
        "photoUrl",
        "_id",
        "gender",
        "age",
        "about",
      ])
      .populate("receiverId", [
        "firstname",
        "lastname",
        "photoUrl",
        "_id",
        "gender",
        "age",
        "about",
      ]);

    // little complex
    const data = connectionRequests.map((row) => {
      if (row.senderId._id.toString() === loggedInUser._id.toString()) {
        return row.receiverId;
      } else {
        return row.senderId;
      }
    });
    res.json({
      message: "Connection requests fetched successfully",
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

userRouter.get("/user/feed", useAuth, async (req, res) => {
  try {
    // TODO
    // User should be able to see the profiles of other users on the platform
    // 0. hiw own profile
    // 1.his connections
    // ignored people
    // already sent the request
    // Eg , Gourab , Virat , Kohli, Donald, MS , Hitman

    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;   // Default page = 1
    let limit = parseInt(req.query.limit) || 10; // Default limit = 10
    limit = limit > 50 ? 50 : limit;
    let skip = (page - 1) * limit; // Calculate the number of documents to skip

    // find all connections request (sent , received)
    const connectionRequests = await connectionRequestModel
      .find({
        $or: [{ senderId: loggedInUser._id }, { receiverId: loggedInUser._id }],
      })
      .select("senderId receiverId");
    const hiddenUsersFromFeed = new Set();
    connectionRequests.forEach((request) => {
      hiddenUsersFromFeed.add(request.senderId.toString());
      hiddenUsersFromFeed.add(request.receiverId.toString());
    });

    const users = await User.find({
      $and: [
        {
          _id: {
            $nin: Array.from(hiddenUsersFromFeed),
          }
        },
        {
          _id: {
            $ne: loggedInUser._id,
          }
        }
      ],
    }).select("firstname lastname photoUrl _id gender age about")
    .skip(skip).limit(limit);
    res.json({
      message: "Connection requests fetched successfully",
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
module.exports = userRouter;
