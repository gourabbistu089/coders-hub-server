const mongoose = require('mongoose');

const connectionRequestSchema = new mongoose.Schema({
   senderId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
   },
   receiverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required:true
   },
   status:{
    type:String,
    enum:['ignored','interested','accepted','rejected'],
    default:'pending',
    message:'Invalid status',
    required:true
   }
},{timestamps:true});


// ConnectionRequest.find
connectionRequestSchema.index({senderId:1,receiverId:1})


connectionRequestSchema.pre('save', function (next) {
    const connectionRequest = this;
    // check if the senderId and receiverId are different
    if (connectionRequest.senderId.equals(connectionRequest.receiverId)) {
      return next(new Error('Sender and receiver cannot be the same'));
    }
    next();
  });



module.exports = mongoose.model('connectionRequestModel', connectionRequestSchema);