require('dotenv').config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const razorpayRoutes = require('./routes/razorpayRoutes');
const path = require('path');
const connectDB = require('./config/db');
const scheduleSlotGeneration = require('./utils/slotGenerator'); // Import the scheduler directly

// Load env vars

// Connect to database
connectDB();

// Schedule daily slot generation
scheduleSlotGeneration();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://quick-court-beige.vercel.app/', // ✅ your current deployed frontend
    ],
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
app.use('/api/courts', require('./routes/courtRoutes')); // Mount court routes
app.use('/api/admin', require('./routes/adminRoutes'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

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

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
