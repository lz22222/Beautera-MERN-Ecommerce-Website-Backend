// Import the Cloudinary library
const cloudinary = require("cloudinary").v2;

// Load environment variables from the .env file
require("dotenv").config(); 

// Get Cloudinary configuration values from the environment variables
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME; // Cloudinary cloud name
const api_key = process.env.CLOUDINARY_API_KEY;       // Cloudinary API key
const api_secret = process.env.CLOUDINARY_API_SECRET; // Cloudinary API secret

// Configure Cloudinary with the retrieved credentials
cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

// Options for the Cloudinary upload
const opts = {
  overwrite: true,          // Overwrite existing resources with the same public ID
  invalidate: true,         // Invalidate cached versions of the uploaded resource
  resource_type: "auto",    // Automatically detect the resource type (e.g., image, video)
};

// Export a function to handle image uploads to Cloudinary
// The function takes an image (in base64 format) as input
module.exports = (image) => {
  return new Promise((resolve, reject) => {
    // Use Cloudinary's uploader to upload the image
    cloudinary.uploader.upload(image, opts, (error, result) => {
      // If the upload is successful and a secure URL is available, resolve the promise
      if (result && result.secure_url) {
        // Return the secure URL of the uploaded image
        return resolve(result.secure_url);
      }
      // Log the error message if the upload fails
      console.log(error.message);
      // Reject the promise with an error message
      return reject({ message: error.message });
    });
  });
};
