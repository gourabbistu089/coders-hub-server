const express = require("express");
const { useAuth } = require("../middleware/auth");
const connectionRequestModel = require("../models/connectionRequest.model");
const User = require("../models/user.model");
const requestRouter = express.Router();

requestRouter.post(
  "/request/send/:status/:toUserId",
  useAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const fromUserId = loggedInUser._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status type " + status,
        });
      }

      //    check receiver user exist or not
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          success: false,
          message: "Receiver user not found",
        });
      }

      // check if connection request already exists
      const existingConnectionRequest = await connectionRequestModel.findOne({
        $or: [
          { senderId: fromUserId, receiverId: toUserId },
          { senderId: toUserId, receiverId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).json({
          success: false,
          message: "Connection request already exists",
        });
      }

      const connectionRequest = await connectionRequestModel.create({
        senderId: fromUserId,
        receiverId: toUserId,
        status,
      });
      const savedConnectionRequest = await connectionRequest.save();
      res.json({
        success: true,
        data: savedConnectionRequest,
        message: req.user.firstname + " is " + status + " to " + toUser.firstname,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error in sending connection request",
        error: error.message,
      });
    }
  }
);

// requestRouter.post("/request/review/:status/:requestId", useAuth, async (req, res) => {
//     try {
//         const {status, requestId} = req.params;
        

//         const loggedInUser = req.user;
//         const allowedStatus = ["accepted", "rejected",];
//         if(!allowedStatus.includes(status)){
//             return res.status(400).json({
//                 success: false, 
//                 message: "Invalid status type " + status,
//             });
//         }   
//         const connectionRequest = await connectionRequestModel.findOne({
//           senderId: requestId,
//           receiverId: loggedInUser._id,
//           status: "pending"  // Only update requests that are still pending
//         });
//         if(!connectionRequest){
//             return res.status(400).json({
//                 success: false, 
//                 data: {
//                   loggedInUser,
//                   requestId
//                 },
//                 message: "Connection request not found yo",
//             });
//         }
//         connectionRequest.status = status;
//         const savedConnectionRequest = await connectionRequest.save();
//         res.json({
//             success: true,
//             data: savedConnectionRequest,
//             message: "Connection request "+ status +" successfully"
//         })
//         // validation on status
//         // King to Hitman
//         // loggedInUser = toUserId
//         // status = interested
//         // requestId should be valid


//     } catch (error) {
        
//     }
// })

requestRouter.post("/request/review/:status/:requestId", useAuth, async (req, res) => {
  try {
    const { status, requestId } = req.params;
    const loggedInUser = req.user;
    
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status type " + status,
      });
    }
    
    // Look for a pending connection request where the requestId is the senderId
    const connectionRequest = await connectionRequestModel.findOne({
      senderId: requestId,
      receiverId: loggedInUser._id,
      status: "interested"  // Only update requests that are still pending
    });
    
    if (!connectionRequest) {
      return res.status(404).json({
        success: false,
        data: {
          loggedInUser: loggedInUser._id,
          requestId
        },
        message: "Pending connection request not found",
      });
    }
    
    // Update the status
    connectionRequest.status = status;
    const savedConnectionRequest = await connectionRequest.save();
    
    res.json({
      success: true,
      data: savedConnectionRequest,
      message: "Connection request " + status + " successfully"
    });
    
  } catch (error) {
    console.error("Error handling connection request:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing connection request",
      error: error.message
    });
  }
});

module.exports = requestRouter;
