const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const razorpayRoutes = require('./routes/razorpayRoutes');
const path = require('path');
const connectDB = require('./config/db');
const scheduleSlotGeneration = require('./utils/slotGenerator'); // Import the scheduler directly
const fs = require('fs'); // Import fs for file system operations

// Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, 'uploads');
// // Only create uploads directory if not on Vercel
// if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
// }

// Load env vars

// Connect to database
// scheduleSlotGeneration();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Handle double /api/api/... prefixes gracefully
app.use('/api/api', (req, res, next) => {
    const newUrl = req.originalUrl.replace('/api/api', '/api');
    console.log('🔁 Redirecting double API path ->', newUrl);
    req.url = newUrl;
    next();
  });
  
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    /\.vercel\.app$/,  // allow any Vercel deployment
    'https://quick-court-beige.vercel.app',
    'https://quick-court-wrx0.onrender.com',
    'https://quick-court-beige.vercel.app',
    'https://quick-court-anvaymuparkar-5452s-projects.vercel.app',
  ];
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['x-rth-fingerprint-id'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-rth-fingerprint-id'],
  }));
  
// Mount Routes
app.use('/api/razorpay', razorpayRoutes);

// Mount Auth routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/facilities', require('./routes/facilityRoutes'));

app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/courts', require('./routes/courtRoutes')); // Mount court routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.error(err));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Test route for debugging
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});
// Add this before the PORT declaration in server.js
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({ 
        message: 'Internal server error', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// This middleware will catch any response that might not be a string and stringify it
// This is a last resort to prevent Vercel's BODY_NOT_A_STRING_FROM_FUNCTION error
app.use((req, res, next) => {
    if (typeof res.body === 'object' && res.body !== null && !res.headersSent) {
        res.set('Content-Type', 'application/json');
        res.send(JSON.stringify(res.body));
    } else {
        next();
    }
});

// Fallback logger for debugging unhandled routes
app.use((req, res, next) => {
  console.warn('⚠️ Unhandled route:', req.method, req.originalUrl);
  res.status(404).json({ message: 'Route not found', path: req.originalUrl });
});

// This is only for local development, Vercel will handle the port
// const PORT = process.env.PORT || 8000;

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// Ensure DB connection before starting the app
(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');
    // If you need the app to listen on a port for local testing, add it here.
    // const PORT = process.env.PORT || 8000;
    // app.listen(PORT, () => {
    //   console.log(`Server running on port ${PORT}`);
    // });
  } catch (error) {
    console.error('❌ Application failed to start due to database connection error:', error);
    process.exit(1); // Exit with a failure code
  }
})();

// Handle unhandled promise rejections (safety net)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection! Shutting down...', err);
  process.exit(1); // Exit with a failure code
});

module.exports = app;
