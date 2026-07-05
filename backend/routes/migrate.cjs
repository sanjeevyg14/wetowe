/**
 * migrate.cjs — Admin-only API route for migrating images from Cloudinary to R2
 * 
 * FIXED: Added doc.markModified() for Mongoose to detect array changes.
 * ADDED: Recovery mode to handle broken R2 URLs (from deleted bucket).
 * 
 * Endpoints:
 *   POST /api/admin/migrate          — migrate next batch of Cloudinary URLs
 *   POST /api/admin/migrate/recover  — recover broken R2 URLs by re-downloading from Cloudinary
 *   GET  /api/admin/migrate/status   — check remaining Cloudinary + broken R2 URLs
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

// --- R2 Client (lazy init) ---
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

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dtqm2zymh';

function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('unrecoverable=true')) return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

function isR2Url(url) {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('unrecoverable=true')) return false;
  const publicUrl = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');
  return publicUrl && url.startsWith(publicUrl);
}

/**
 * Given a broken R2 URL like:
 *   https://pub-xxx.r2.dev/trip/1720176000000-originalname.jpg
 * Extract the original filename: "originalname.jpg"
 * Then try to find it on Cloudinary at the known upload folder.
 */
function extractOriginalFilename(r2Url) {
  try {
    const urlPath = new URL(r2Url).pathname; // e.g., /trip/1720176000000-originalname.jpg
    const filename = urlPath.split('/').pop(); // e.g., 1720176000000-originalname.jpg
    // Remove the timestamp prefix: "1720176000000-"
    const match = filename.match(/^\d+-(.+)$/);
    return match ? match[1] : filename;
  } catch {
    return null;
  }
}

/**
 * Try to reconstruct possible Cloudinary URLs for a given original filename.
 * Cloudinary stores files in various paths, so we try the most common ones.
 */
function buildCloudinarySearchUrls(originalFilename) {
  const base = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  return [
    `${base}/wheel-to-wilderness/${originalFilename}`,
    `${base}/v1/${originalFilename}`,
    `${base}/${originalFilename}`,
  ];
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (response) => {
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
    });
    req.on('error', reject);
    // Timeout after 15 seconds
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('Download timeout'));
    });
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

/**
 * Try to recover a broken R2 URL by re-downloading from Cloudinary.
 * Returns the new R2 URL, or null if recovery failed.
 */
async function recoverOneUrl(brokenR2Url, prefix) {
  const originalFilename = extractOriginalFilename(brokenR2Url);
  if (!originalFilename) return null;

  const candidates = buildCloudinarySearchUrls(originalFilename);
  
  for (const candidateUrl of candidates) {
    try {
      const buffer = await downloadImage(candidateUrl);
      const uniqueKey = `${prefix}/${Date.now()}-${originalFilename}`;
      const contentType = getContentType(originalFilename);
      const newUrl = await uploadToR2(buffer, uniqueKey, contentType);
      return newUrl;
    } catch {
      // Try next candidate URL
      continue;
    }
  }
  return null; // All candidates failed
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
 * Scan all collections and return URLs that need migration.
 * Finds both Cloudinary URLs AND broken R2 URLs (from deleted bucket).
 */
async function findUrlsToMigrate() {
  const cloudinaryUrls = [];
  const brokenR2Urls = [];

  for (const col of COLLECTIONS) {
    const docs = await col.Model.find({});
    for (const doc of docs) {
      for (const field of col.fields) {
        if (field.type === 'string') {
          const url = doc[field.name];
          if (isCloudinaryUrl(url)) {
            cloudinaryUrls.push({ docId: doc._id, model: col.name, fieldName: field.name, fieldType: 'string', url });
          } else if (isR2Url(url)) {
            brokenR2Urls.push({ docId: doc._id, model: col.name, fieldName: field.name, fieldType: 'string', url });
          }
        } else if (field.type === 'array') {
          const arr = doc[field.name] || [];
          for (let i = 0; i < arr.length; i++) {
            if (isCloudinaryUrl(arr[i])) {
              cloudinaryUrls.push({ docId: doc._id, model: col.name, fieldName: field.name, fieldType: 'array', url: arr[i], arrayIndex: i });
            } else if (isR2Url(arr[i])) {
              brokenR2Urls.push({ docId: doc._id, model: col.name, fieldName: field.name, fieldType: 'array', url: arr[i], arrayIndex: i });
            }
          }
        }
      }
    }
  }
  return { cloudinaryUrls, brokenR2Urls };
}

// Helper to update a document field
async function updateDocField(item, newUrl) {
  const col = COLLECTIONS.find(c => c.name === item.model);
  const doc = await col.Model.findById(item.docId);
  if (!doc) return false;

  if (item.fieldType === 'string') {
    doc[item.fieldName] = newUrl;
    doc.markModified(item.fieldName);
  } else if (item.fieldType === 'array') {
    const arr = doc[item.fieldName] || [];
    const idx = arr.indexOf(item.url);
    if (idx !== -1) {
      arr[idx] = newUrl;
      doc[item.fieldName] = arr;
      doc.markModified(item.fieldName);
    }
  }

  await doc.save();
  return true;
}

// ─── GET /api/admin/migrate/status ──────────────────────────────────────────
router.get('/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { cloudinaryUrls, brokenR2Urls } = await findUrlsToMigrate();
    res.json({
      cloudinaryUrlsRemaining: cloudinaryUrls.length,
      brokenR2UrlsRemaining: brokenR2Urls.length,
      totalRemaining: cloudinaryUrls.length + brokenR2Urls.length,
      cloudinaryDetails: cloudinaryUrls.map(u => ({ model: u.model, field: u.fieldName, url: u.url.substring(0, 80) })),
      brokenR2Details: brokenR2Urls.map(u => ({ model: u.model, field: u.fieldName, url: u.url.substring(0, 80) })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error checking status', error: error.message });
  }
});

// ─── POST /api/admin/migrate ────────────────────────────────────────────────
// Migrates Cloudinary URLs → R2
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
      return res.status(500).json({ message: 'R2 environment variables are not configured on the server.' });
    }

    const batchSize = Math.min(parseInt(req.query.batch) || 3, 10);
    const { cloudinaryUrls } = await findUrlsToMigrate();

    if (cloudinaryUrls.length === 0) {
      return res.json({ done: true, message: 'No Cloudinary URLs left to migrate!', remaining: 0 });
    }

    const batch = cloudinaryUrls.slice(0, batchSize);
    const results = [];

    for (const item of batch) {
      try {
        const newUrl = await migrateOneUrl(item.url, item.model.toLowerCase());
        const saved = await updateDocField(item, newUrl);
        results.push({
          model: item.model, field: item.fieldName, status: saved ? 'migrated' : 'skipped',
          oldUrl: item.url.substring(0, 60), newUrl: newUrl.substring(0, 60)
        });
      } catch (err) {
        const fallbackUrl = item.url + (item.url.includes('?') ? '&' : '?') + 'unrecoverable=true';
        await updateDocField(item, fallbackUrl);
        results.push({ model: item.model, field: item.fieldName, status: 'failed_skipped', error: err.message, url: item.url });
      }
    }

    const remaining = cloudinaryUrls.length - batch.length;
    res.json({
      done: remaining <= 0,
      migrated: results.filter(r => r.status === 'migrated').length,
      failed: results.filter(r => r.status === 'failed_skipped').length,
      remaining: Math.max(0, remaining),
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Migration error', error: error.message });
  }
});

// ─── POST /api/admin/migrate/recover ────────────────────────────────────────
// Recovers broken R2 URLs by re-downloading from Cloudinary using the original filename
router.post('/recover', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.R2_PUBLIC_URL) {
      return res.status(500).json({ message: 'R2 environment variables are not configured on the server.' });
    }

    const batchSize = Math.min(parseInt(req.query.batch) || 3, 10);
    const { brokenR2Urls } = await findUrlsToMigrate();

    if (brokenR2Urls.length === 0) {
      return res.json({ done: true, message: 'No broken R2 URLs to recover!', remaining: 0 });
    }

    const batch = brokenR2Urls.slice(0, batchSize);
    const results = [];

    for (const item of batch) {
      try {
        const newUrl = await recoverOneUrl(item.url, item.model.toLowerCase());
        if (newUrl) {
          const saved = await updateDocField(item, newUrl);
          results.push({
            model: item.model, field: item.fieldName, status: saved ? 'recovered' : 'skipped',
            oldUrl: item.url.substring(0, 60), newUrl: newUrl.substring(0, 60)
          });
        } else {
          const fallbackUrl = item.url + (item.url.includes('?') ? '&' : '?') + 'unrecoverable=true';
          await updateDocField(item, fallbackUrl);
          results.push({
            model: item.model, field: item.fieldName, status: 'failed_skipped',
            error: 'Could not find original file on Cloudinary', url: item.url
          });
        }
      } catch (err) {
        const fallbackUrl = item.url + (item.url.includes('?') ? '&' : '?') + 'unrecoverable=true';
        await updateDocField(item, fallbackUrl);
        results.push({ model: item.model, field: item.fieldName, status: 'failed_skipped', error: err.message, url: item.url });
      }
    }

    const remaining = brokenR2Urls.length - batch.length;
    res.json({
      done: remaining <= 0,
      recovered: results.filter(r => r.status === 'recovered').length,
      failed: results.filter(r => r.status === 'failed_skipped').length,
      remaining: Math.max(0, remaining),
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Recovery error', error: error.message });
  }
});

module.exports = router;
