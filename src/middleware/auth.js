const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const useAuth = async (req, res, next) => {
    try {
        // Read the token from cookies
        // console.log(req.cookies);
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "User is not logged in"
            })
        }

        // Verify the token
        const decodedObj = jwt.verify(token, "your_secret_key");

        // Find the user by decoded ID
        const user = await User.findById(decodedObj._id);

        if (!user) {
            throw new Error("User not found");
        }

        // Attach user to request
        req.user = user;

        // Continue to the next middleware
        next();
    } catch (error) {
        console.log("Error in " + error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {useAuth};
