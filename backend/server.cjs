const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./lib/db.cjs');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust first proxy (Vercel/CDN) so rate-limiter uses real client IP from X-Forwarded-For
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://aistudiocdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://fonts.cdnfonts.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || "*", "https://*.vercel.app"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://fonts.cdnfonts.com", "https://fonts.googleapis.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  // Disable CSP entirely for API-only responses (JSON)
  // The frontend SPA serves its own CSP via the static HTML
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting - General API (generous for content-heavy travel site)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  skip: (req) => {
    // Skip rate limit for migration routes
    if (req.originalUrl && req.originalUrl.includes('/api/admin/migrate')) return true;
    // Skip rate limit for authenticated admin requests
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') return true;
      } catch (e) { /* token invalid, don't skip */ }
    }
    return false;
  },
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting - Auth endpoints (more strict)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 auth requests per windowMs
  message: { message: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);

// CORS configuration - Ensure FRONTEND_URL is set in production
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: FRONTEND_URL not set in production. CORS will allow all origins.');
}

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Limit URL-encoded bodies
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// Request Logging Middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });
}

// Import Routes
const tripRoutes = require('./routes/trips.cjs');
const authRoutes = require('./routes/auth.cjs');
const bookingRoutes = require('./routes/bookings.cjs');
const testimonialRoutes = require('./routes/testimonials.cjs');
const statsRoutes = require('./routes/stats.cjs');
const enquiryRoutes = require('./routes/enquiries.cjs');
const uploadRoutes = require('./routes/upload.cjs');
const galleryRoutes = require('./routes/gallery.cjs');
const marqueeRoutes = require('./routes/marquee.cjs');
const seoRoutes = require('./routes/seo.cjs');
const heroRoutes = require('./routes/hero.cjs');
const teamRoutes = require('./routes/team.cjs');
const settingsRoutes = require('./routes/settings.cjs');
const migrateRoutes = require('./routes/migrate.cjs');
const { cleanupExpiredBookings } = require('./lib/bookingUtils.cjs');

// Connect to Database (Serverless optimized)
connectDB().then(async () => {
  console.log('✅ MongoDB Connected (Cached)');
  // Clean up any expired pending bookings on startup
  const expiredCount = await cleanupExpiredBookings();
  console.log(`🧹 Initial cleanup: ${expiredCount} expired booking(s) cleared`);
}).catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
});

// Periodic cleanup of expired pending bookings (every 5 minutes)
// This ensures seats are released even if no one checks availability
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
setInterval(async () => {
  try {
    const expiredCount = await cleanupExpiredBookings();
    if (expiredCount > 0) {
      console.log(`🧹 Periodic cleanup: ${expiredCount} expired booking(s) cleared`);
    }
  } catch (error) {
    console.error('❌ Periodic cleanup error:', error.message);
  }
}, CLEANUP_INTERVAL);

// Use Routes
app.use('/api/trips', tripRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/marquee', marqueeRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/migrate', migrateRoutes);

// Base Route
app.get('/', (req, res) => {
  res.send('Wheel to Wilderness API is running...');
});

app.get('/api', (req, res) => {
  res.send('Wheel to Wilderness API is running...');
});

// ── Dynamic Open Graph injection for /trip/:id ──────────────────────────────
// Crawlers (WhatsApp, Telegram, Twitter, Facebook, Google) need OG tags in
// the server-rendered HTML.  React-Helmet-Async cannot help them because they
// don't execute JavaScript.  We intercept the request here, fetch the trip
// from MongoDB, patch index.html with the correct meta tags, and serve it.
// Regular browsers also receive this HTML; React then hydrates normally.

const CRAWLER_UA = /WhatsApp|Twitterbot|facebookexternalhit|LinkedInBot|Googlebot|Slackbot|Discordbot|TelegramBot|bingbot|Applebot/i;
const SITE_URL = 'https://wheelstowilderness.in';
const FALLBACK_IMAGE = `${SITE_URL}/og-image.jpg`;

// Helper: build the patched <head> string
function injectOgTags(html, { title, description, image, url }) {
  const esc = (s) => String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeTitle = esc(title);
  const safeDesc = esc(description);
  const safeImg = esc(image);
  const safeUrl = esc(url);

  const ogTags = [
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:image" content="${safeImg}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:site_name" content="Wheels to Wilderness" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:url" content="${safeUrl}" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    `<meta name="twitter:image" content="${safeImg}" />`,
    `<meta name="twitter:site" content="@wheelstowild" />`,
    `<title>${safeTitle} | Wheels to Wilderness</title>`,
    `<meta name="description" content="${safeDesc}" />`,
    `<link rel="canonical" href="${safeUrl}" />`,
  ].join('\n    ');

  // Remove existing OG/Twitter/title/description tags so we don't duplicate
  let patched = html
    .replace(/<title>[^<]*<\/title>/gi, '')
    .replace(/<meta\s+(?:property|name)="(?:og:|twitter:|description|title)[^"]*"[^>]*\/>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*\/>/gi, '')
    .replace('</head>', `    ${ogTags}\n  </head>`);

  return patched;
}

// Read the built index.html (Vercel serves from /dist)
function readIndexHtml() {
  // In Vercel production the static build is at /var/task/dist/index.html
  // In local dev it's at <project-root>/dist/index.html
  const candidates = [
    path.join(__dirname, '..', 'dist', 'index.html'),
    path.join(__dirname, '..', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return null;
}

// GET /trip/:id  – dynamic OG injection
app.get('/trip/:id', async (req, res, next) => {
  try {
    const ua = req.headers['user-agent'] || '';
    const isCrawler = CRAWLER_UA.test(ua);

    // Fetch the trip regardless (both crawlers and browsers benefit from
    // correct meta tags for SEO)
    const TripModel = require('./models/Trip.cjs');
    const mongoose = require('mongoose');
    await connectDB();

    let trip = null;
    const tripId = req.params.id;
    if (mongoose.Types.ObjectId.isValid(tripId)) {
      trip = await TripModel.findById(tripId).lean();
    }
    if (!trip) {
      trip = await TripModel.findOne({ slug: tripId }).lean();
    }

    const tripUrl = `${SITE_URL}/trip/${tripId}`;

    if (!trip) {
      // If trip not found and it's a crawler, serve a minimal page
      if (isCrawler) {
        return res.status(404).send(`<html><head><title>Trip not found | Wheels to Wilderness</title></head><body>Trip not found.</body></html>`);
      }
      // For browsers, fall through to SPA
      return next();
    }

    const meta = {
      title: trip.title,
      description: (trip.description || '').substring(0, 200),
      image: trip.imageUrl || FALLBACK_IMAGE,
      url: tripUrl,
    };

    const html = readIndexHtml();
    if (!html) {
      // index.html not built yet (local dev before `npm run build`)
      // Just serve minimal OG-only page for crawlers, let SPA handle browsers
      if (isCrawler) {
        const esc = (s) => String(s ?? '').replace(/"/g, '&quot;');
        return res.send(`<!DOCTYPE html><html><head>
          <meta property="og:title" content="${esc(meta.title)}" />
          <meta property="og:description" content="${esc(meta.description)}" />
          <meta property="og:image" content="${esc(meta.image)}" />
          <meta property="og:url" content="${esc(meta.url)}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:image" content="${esc(meta.image)}" />
          <title>${esc(meta.title)} | Wheels to Wilderness</title>
        </head><body></body></html>`);
      }
      return next();
    }

    const patched = injectOgTags(html, meta);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Cache for 5 minutes on CDN, 60 seconds on browser
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    return res.send(patched);
  } catch (err) {
    console.error('[OG injection error]', err.message);
    next();
  }
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