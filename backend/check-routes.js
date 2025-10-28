const path = require('path');

const routes = [
  './routes/razorpayRoutes',
  './routes/authRoutes',
  './routes/userRoutes',
  './routes/facilityRoutes',
  './routes/bookingRoutes',
  './routes/reviewRoutes',
  './routes/courtRoutes',
  './routes/adminRoutes',
];

console.log('Checking route modules...');

routes.forEach((r) => {
  try {
    const fullPath = path.join(__dirname, r);
    require(fullPath);
    console.log(`OK: ${r}`);
  } catch (err) {
    console.error(`ERROR loading ${r}:`, err && err.stack ? err.stack : err);
  }
});

console.log('Done.');
