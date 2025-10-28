const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const razorpayRoutes = require('./routes/razorpayRoutes');
const path = require('path');
const connectDB = require('./config/db');
const scheduleSlotGeneration = require('./utils/slotGenerator');
const fs = require('fs');

const app = express();

// ----------------------------
// 🧩 Middleware Configuration
// ----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fix double /api/api prefixes safely (no regex routes)
app.use((req, res, next) => {
  if (req.originalUrl.startsWith('/api/api')) {
    const newUrl = req.originalUrl.replace('/api/api', '/api');
    console.log('🔁 Redirecting double API path ->', newUrl);
    req.url = newUrl;
  }
  next();
});

// ✅ CORS Setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  /\.vercel\.app$/, // allow any Vercel deployment
  'https://quick-court-beige.vercel.app',
  'https://quick-court-wrx0.onrender.com',
  'https://quick-court-anvaymuparkar-5452s-projects.vercel.app',
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['x-rth-fingerprint-id'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-rth-fingerprint-id'],
  })
);

// ----------------------------
// ⚙️ API Routes Configuration
// ----------------------------
const apiRouter = express.Router();

apiRouter.use('/payments', razorpayRoutes);
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/facilities', require('./routes/facilityRoutes'));
apiRouter.use('/bookings', require('./routes/bookingRoutes'));
apiRouter.use('/reviews', require('./routes/reviewRoutes'));
apiRouter.use('/courts', require('./routes/courtRoutes'));
apiRouter.use('/admin', require('./routes/adminRoutes'));

// ✅ Mount all API routes under /api
app.use('/api', apiRouter);

// ----------------------------
// 🧠 Test + Default Routes
// ----------------------------
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------
// 🛡️ Global Error Handler
// ----------------------------
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    message: 'Internal server error',
    error:
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'Something went wrong',
  });
});

// ----------------------------
// 🧰 Response Safety Middleware
// ----------------------------
app.use((req, res, next) => {
  if (typeof res.body === 'object' && res.body !== null && !res.headersSent) {
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify(res.body));
  } else {
    next();
  }
});

// ----------------------------
// 🌍 Static File Serving
// ----------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // ✅ Catch-all for SPA routing (important)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
  });
} else {
  // Dev: log unhandled routes
  app.use((req, res) => {
    console.warn('⚠️ Unhandled route:', req.method, req.originalUrl);
    res.status(404).json({
      message: 'Route not found',
      path: req.originalUrl,
    });
  });
}

// ----------------------------
// 🚀 Server Initialization
// ----------------------------
const PORT = process.env.PORT || 10000;

(async () => {
  try {
    await connectDB();
    console.log('✅ Database connected successfully.');

    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      console.log(`🚀 Server running on ${address.address}:${address.port}`);
    });
  } catch (error) {
    console.error(
      '❌ Application failed to start due to database connection error:',
      error
    );
    process.exit(1);
  }
})();

// ----------------------------
// ⚠️ Safety Net for Unhandled Rejections
// ----------------------------
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection! Shutting down...', err);
  process.exit(1);
});

module.exports = app;
