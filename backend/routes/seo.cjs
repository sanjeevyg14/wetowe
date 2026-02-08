const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip.cjs');
const connectDB = require('../lib/db.cjs');

const BASE_URL = 'https://wheelstowilderness.in';

// Generate dynamic sitemap
router.get('/sitemap.xml', async (req, res) => {
    try {
        await connectDB();

        // Fetch all active trips
        const trips = await Trip.find({ isActive: { $ne: false } })
            .select('slug updatedAt imageUrl title')
            .lean();

        const today = new Date().toISOString().split('T')[0];

        // Static pages
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'daily' },
            { url: '/destinations', priority: '0.9', changefreq: 'daily' },
            { url: '/our-story', priority: '0.7', changefreq: 'monthly' },
            { url: '/team', priority: '0.6', changefreq: 'monthly' },
            { url: '/contact', priority: '0.8', changefreq: 'monthly' },
            { url: '/terms', priority: '0.4', changefreq: 'yearly' },
            { url: '/cancellation-policy', priority: '0.4', changefreq: 'yearly' },
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

        // Add static pages
        for (const page of staticPages) {
            xml += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
        }

        // Add dynamic trip pages
        for (const trip of trips) {
            const lastmod = trip.updatedAt
                ? new Date(trip.updatedAt).toISOString().split('T')[0]
                : today;

            xml += `
  <url>
    <loc>${BASE_URL}/trip/${trip.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

            // Add image if available
            if (trip.imageUrl) {
                xml += `
    <image:image>
      <image:loc>${trip.imageUrl}</image:loc>
      <image:title>${trip.title || 'Trip Image'}</image:title>
    </image:image>`;
            }

            xml += `
  </url>`;
        }

        xml += `
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        res.send(xml);

    } catch (err) {
        console.error('Sitemap generation error:', err);
        res.status(500).send('Error generating sitemap');
    }
});

// Generate robots.txt dynamically (optional - can use static file)
router.get('/robots.txt', (req, res) => {
    const robotsTxt = `# Robots.txt for Wheels to Wilderness
# ${BASE_URL}

User-agent: *
Allow: /

# Disallow admin and private pages
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*
Disallow: /login
Disallow: /signup
Disallow: /profile
Disallow: /my-bookings

# Sitemap location
Sitemap: ${BASE_URL}/api/seo/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1

# Google specific
User-agent: Googlebot
Allow: /
Disallow: /admin

# Bing specific
User-agent: Bingbot
Allow: /
Disallow: /admin
`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
});

module.exports = router;
