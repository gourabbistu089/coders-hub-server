const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");


const userSchema = new Schema({
    firstname:{
        type:String,
        required:true,
        minLength:4,
        maxLength:25,
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid email address');
            }
        }
    },
    password:{
        type:String,
        required:true,
        validate(value){
            if(!validator.isStrongPassword(value)){
                throw new Error('Password is not strong enough');
            }
        }
    },
    age:{
        type:Number,
    },
    gender:{
        type:String,
        enum:['male','female','other']
    },
    photoUrl:{
        type:String,
        default:"https://www.shutterstock.com/shutterstock/photos/1290556063/display_1500/stock-vector-vector-design-of-avatar-and-dummy-sign-collection-of-avatar-and-image-stock-vector-illustration-1290556063.jpg",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error('Invalid photo URL');
            }
        }
    },
    about:{
        type:String,
        default:"This is default of about of user"
    },
    skills:{
        type:[String]
    }

},{timestamps:true});


// User.find({firstname:})
userSchema.index({firstname:1,lastname:1});

userSchema.methods.getJWT = async function () {
    const user = this
    const token = jwt.sign({_id:user._id}, "your_secret_key",{
        expiresIn:"7d"
    })
    // console.log("token",token);
    return token;
}
userSchema.methods.validatePassword = async function (password){
    console.log("this.password",this.password);
    console.log("password",password);
    const isPasswordValid = await bcrypt.compare(password, this.password)
    console.log("isPasswordValid",isPasswordValid);
    return isPasswordValid;
}
module.exports = mongoose.model('User',userSchema);