const cloudinary = require('cloudinary').v2;

// Debug: Log environment variables (remove in production)
console.log('Cloudinary Config Debug:');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set (length: ' + process.env.CLOUDINARY_API_KEY.length + ')' : 'Not set');
console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (length: ' + process.env.CLOUDINARY_API_SECRET.length + ')' : 'Not set');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test the connection
cloudinary.api.ping()
    .then(result => console.log('Cloudinary connection successful:', result))
    .catch(error => console.error('Cloudinary connection failed:', error.message));

module.exports = cloudinary;