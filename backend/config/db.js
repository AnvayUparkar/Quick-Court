const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // In a serverless environment, exiting the process abruptly prevents a response.
        // Instead, log the error and let the application attempt to handle requests gracefully.
        // process.exit(1);
    }
};

module.exports = connectDB;
