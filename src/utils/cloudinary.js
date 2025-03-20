const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// console.log("Cloudinary config initialized");

exports.uploadOnCloudinary = async (localFilePath) => {
  try {
    console.log(`Uploading file from path: ${localFilePath}`);

    if (!localFilePath) {
      throw new Error("Local file path is not provided");
    }

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically detect type (image, video, etc.)
    });
    console.log("File successfully uploaded to Cloudinary");
    console.log(`Cloudinary URL: ${response.secure_url}`);

    // Delete local file after upload
    try {
      fs.unlinkSync(localFilePath);
      console.log(`Local file deleted: ${localFilePath}`);
    } catch (fileError) {
      console.error(`Failed to delete local file: ${localFilePath}`, fileError);
    }

    return response;
  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);

    // Try to delete the local file in case of failure
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
        console.log(`Local file deleted after Cloudinary error: ${localFilePath}`);
      }
    } catch (fileError) {
      console.error(`Failed to delete local file after upload error: ${localFilePath}`, fileError);
    }

    throw new Error("Cloudinary upload failed"); // Re-throw error to notify caller
  }
};
