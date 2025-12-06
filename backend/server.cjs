const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const connectDB = require('./lib/db.cjs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
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
const tripRoutes = require('./routes/trips.cjs');
const paymentRoutes = require('./routes/payment.cjs');
const authRoutes = require('./routes/auth.cjs');
const bookingRoutes = require('./routes/bookings.cjs');
const testimonialRoutes = require('./routes/testimonials.cjs');
const statsRoutes = require('./routes/stats.cjs');
const enquiryRoutes = require('./routes/enquiries.cjs');
const uploadRoutes = require('./routes/upload.cjs');
const galleryRoutes = require('./routes/gallery.cjs'); // Import the new gallery route

// Connect to Database (Serverless optimized)
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
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes); // Use the new gallery route

// Base Route
app.get('/', (req, res) => {
  res.send('Wheel to Wilderness API is running...');
});

app.get('/api', (req, res) => {
  res.send('Wheel to Wilderness API is running...');
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Export the app for Vercel serverless functions
module.exports = app;

// Only listen if run directly (local development)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}