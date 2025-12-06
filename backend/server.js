const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./lib/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Restrict in production if possible
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Import Routes
const tripRoutes = require('./routes/trips');
const paymentRoutes = require('./routes/payment');
const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const testimonialRoutes = require('./routes/testimonials');
const statsRoutes = require('./routes/stats');
const enquiryRoutes = require('./routes/enquiries');

// Connect to Database (Serverless optimized)
// We invoke this to ensure connection starts, but in serverless,
// verify connection inside critical paths or rely on this cached promise.
connectDB().then(() => {
    console.log('✅ MongoDB Connected (Cached)');
}).catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
});

// Use Routes
app.use('/api/trips', tripRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/enquiries', enquiryRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Wheel to Wilderness API is running...');
});

app.get('/api', (req, res) => {
  res.send('Wheel to Wilderness API is running...');
});

// Export the app for Vercel serverless functions
module.exports = app;

// Only listen if run directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}