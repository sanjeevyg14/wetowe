/**
 * migrate.cjs — Admin-only API route for migrating images from Cloudinary to R2
 * 
 * Designed for Vercel serverless (10s execution limit on free tier).
 * Each call processes a small batch of images (default: 3) and returns progress.
 * Call repeatedly until { done: true }.
 * 
 * Usage:
 *   POST /api/admin/migrate        — migrate next batch (3 images)
 *   POST /api/admin/migrate?batch=5 — migrate next batch (5 images)
 *   GET  /api/admin/migrate/status  — check how many Cloudinary URLs remain
 */

const express = require('express');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const http = require('http');
const path = require('path');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

const router = express.Router();

// --- Models ---
const Trip = require('../models/Trip.cjs');
const Blog = require('../models/Blog.cjs');
const Gallery = require('../models/Gallery.cjs');
const HeroImage = require('../models/HeroImage.cjs');
const TeamMember = require('../models/TeamMember.cjs');
const Testimonial = require('../models/Testimonial.cjs');

// --- R2 Client (lazy init to avoid crash if env vars missing) ---
let _s3Client = null;
function getS3Client() {
  if (!_s3Client) {
    _s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    });
  }
  return _s3Client;
}

// --- Helpers ---

function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}`));
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

function getContentType(url) {
  const ext = path.extname(url.split('?')[0]).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png', '.webp': 'image/webp',
    '.gif': 'image/gif', '.svg': 'image/svg+xml',
  };
  return mimeMap[ext] || 'image/jpeg';
}

async function uploadToR2(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await getS3Client().send(command);
  const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  return `${publicUrl}/${key}`;
}

async function migrateOneUrl(oldUrl, prefix) {
  const buffer = await downloadImage(oldUrl);
  const urlParts = oldUrl.split('/');
  const originalFilename = urlParts[urlParts.length - 1].split('?')[0];
  const uniqueKey = `${prefix}/${Date.now()}-${originalFilename}`;
  const contentType = getContentType(oldUrl);
  const newUrl = await uploadToR2(buffer, uniqueKey, contentType);
  return newUrl;
}

// --- Define all collections and their image fields ---
const COLLECTIONS = [
  { Model: Trip, name: 'Trip', fields: [
    { name: 'imageUrl', type: 'string' },
    { name: 'cardImageUrl', type: 'string' },
    { name: 'gallery', type: 'array' },
  ]},
  { Model: Blog, name: 'Blog', fields: [
    { name: 'imageUrl', type: 'string' },
    { name: 'authorAvatar', type: 'string' },
  ]},
  { Model: Gallery, name: 'Gallery', fields: [
    { name: 'imageUrl', type: 'string' },
  ]},
  { Model: HeroImage, name: 'HeroImage', fields: [
    { name: 'imageUrl', type: 'string' },
  ]},
  { Model: TeamMember, name: 'TeamMember', fields: [
    { name: 'imageUrl', type: 'string' },
  ]},
  { Model: Testimonial, name: 'Testimonial', fields: [
    { name: 'avatarUrl', type: 'string' },
  ]},
];

/**
 * Scan all collections and return a flat list of { doc, model, fieldName, fieldType, url, arrayIndex }
 * for every Cloudinary URL found.
 */
async function findAllCloudinaryUrls() {
  const results = [];
  for (const col of COLLECTIONS) {
    const docs = await col.Model.find({});
    for (const doc of docs) {
      for (const field of col.fields) {
        if (field.type === 'string') {
          const url = doc[field.name];
          if (isCloudinaryUrl(url)) {
            results.push({ docId: doc._id, model: col.name, fieldName: field.name, fieldType: 'string', url });
          }
        } else if (field.type === 'array') {
          const arr = doc[field.name] || [];
          for (let i = 0; i < arr.length; i++) {
            if (isCloudinaryUrl(arr[i])) {
              results.push({ docId: doc._id, model: col.name, fieldName: field.name, fieldType: 'array', url: arr[i], arrayIndex: i });
            }
          }
        }
      }
    }
  }
  return results;
}

// ─── GET /api/admin/migrate/status ──────────────────────────────────────────
router.get('/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const urls = await findAllCloudinaryUrls();
    res.json({
      remainingCloudinaryUrls: urls.length,
      details: urls.map(u => ({ model: u.model, field: u.fieldName, url: u.url.substring(0, 80) + '...' })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking status', error: error.message });
  }
});

// ─── POST /api/admin/migrate ────────────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Validate R2 config
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
      return res.status(500).json({ message: 'R2 environment variables are not configured on the server.' });
    }

    const batchSize = Math.min(parseInt(req.query.batch) || 3, 10); // max 10 per call
    const allUrls = await findAllCloudinaryUrls();

    if (allUrls.length === 0) {
      return res.json({ done: true, message: 'All images have already been migrated!', remaining: 0 });
    }

    const batch = allUrls.slice(0, batchSize);
    const results = [];

    for (const item of batch) {
      try {
        const newUrl = await migrateOneUrl(item.url, item.model.toLowerCase());

        // Find the model class
        const col = COLLECTIONS.find(c => c.name === item.model);
        const doc = await col.Model.findById(item.docId);
        if (!doc) {
          results.push({ model: item.model, field: item.fieldName, status: 'skipped', reason: 'document not found' });
          continue;
        }

        if (item.fieldType === 'string') {
          doc[item.fieldName] = newUrl;
        } else if (item.fieldType === 'array') {
          // Re-find the exact URL in the array (index may have shifted)
          const arr = doc[item.fieldName] || [];
          const idx = arr.indexOf(item.url);
          if (idx !== -1) {
            arr[idx] = newUrl;
            doc[item.fieldName] = arr;
          }
        }

        await doc.save();
        results.push({ model: item.model, field: item.fieldName, status: 'migrated', oldUrl: item.url.substring(0, 60), newUrl: newUrl.substring(0, 60) });
      } catch (err) {
        results.push({ model: item.model, field: item.fieldName, status: 'failed', error: err.message, url: item.url });
      }
    }

    const remaining = allUrls.length - batch.length;
    res.json({
      done: remaining === 0,
      migrated: results.filter(r => r.status === 'migrated').length,
      failed: results.filter(r => r.status === 'failed').length,
      remaining,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Migration error', error: error.message });
  }
});

module.exports = router;
