const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const razorpayRoutes = require('./routes/razorpayRoutes');
const path = require('path');
const connectDB = require('./config/db');
const scheduleSlotGeneration = require('./utils/slotGenerator'); // Import the scheduler directly
const fs = require('fs'); // Import fs for file system operations

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
  
// API Routes Configuration
const apiRouter = express.Router();

// Mount all routes under /api
apiRouter.use('/payments', razorpayRoutes);
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/facilities', require('./routes/facilityRoutes'));
apiRouter.use('/bookings', require('./routes/bookingRoutes'));
apiRouter.use('/reviews', require('./routes/reviewRoutes'));
apiRouter.use('/courts', require('./routes/courtRoutes'));
apiRouter.use('/admin', require('./routes/adminRoutes'));

// Mount the API router
app.use('/api', apiRouter);

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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
  });
} else {
  // Fallback logger for debugging unhandled routes in development
  app.use((req, res, next) => {
    console.warn('⚠️ Unhandled route:', req.method, req.originalUrl);
    res.status(404).json({ message: 'Route not found', path: req.originalUrl });
  });
}

const PORT = process.env.PORT || 10000;

// Ensure DB connection before starting the app
(async () => {
  try {
    await connectDB();
    console.log('Database connected successfully.');
    
    // Start the server with explicit host binding
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      console.log(`Server running on ${address.address}:${address.port}`);
    });
  } catch (error) {
    console.error('❌ Application failed to start due to database connection error:', error);
    process.exit(1);
  }
})();

// Handle unhandled promise rejections (safety net)
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection! Shutting down...', err);
  process.exit(1); // Exit with a failure code
});

module.exports = app;
