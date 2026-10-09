/**
 * migrate-images.js
 * 
 * Automated migration script: Cloudinary → Cloudflare R2
 * 
 * This script will:
 * 1. Connect to your MongoDB database
 * 2. Scan all collections that store image URLs (Trip, Blog, Gallery, HeroImage, TeamMember, Testimonial)
 * 3. Download each Cloudinary image
 * 4. Upload it to Cloudflare R2
 * 5. Update the database record with the new R2 URL
 * 
 * Usage: node backend/migrate-images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const http = require('http');
const path = require('path');

// --- R2 Configuration ---
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');

// --- Load Models ---
const Trip = require('./models/Trip.cjs');
const Blog = require('./models/Blog.cjs');
const Gallery = require('./models/Gallery.cjs');
const HeroImage = require('./models/HeroImage.cjs');
const TeamMember = require('./models/TeamMember.cjs');
const Testimonial = require('./models/Testimonial.cjs');

// --- Stats ---
let totalMigrated = 0;
let totalFailed = 0;
let totalSkipped = 0;

/**
 * Download an image from a URL and return it as a Buffer
 */
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadImage(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Determine content type from URL/extension
 */
function getContentType(url) {
  const ext = path.extname(url.split('?')[0]).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };
  return mimeMap[ext] || 'image/jpeg'; // default to jpeg
}

/**
 * Upload a buffer to Cloudflare R2 and return the public URL
 */
async function uploadToR2(buffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return `${R2_PUBLIC_URL}/${key}`;
}

/**
 * Check if a URL is a Cloudinary URL
 */
function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com');
}

/**
 * Migrate a single image URL: download from Cloudinary, upload to R2, return new URL
 */
async function migrateImageUrl(oldUrl, prefix = 'migrated') {
  if (!isCloudinaryUrl(oldUrl)) {
    totalSkipped++;
    return oldUrl; // Not a Cloudinary URL, keep it unchanged
  }

  try {
    console.log(`  ↓ Downloading: ${oldUrl.substring(0, 80)}...`);
    const buffer = await downloadImage(oldUrl);

    // Generate a unique key preserving original file info
    const urlParts = oldUrl.split('/');
    const originalFilename = urlParts[urlParts.length - 1].split('?')[0]; // remove query params
    const uniqueKey = `${prefix}/${Date.now()}-${originalFilename}`;
    const contentType = getContentType(oldUrl);

    console.log(`  ↑ Uploading to R2: ${uniqueKey} (${(buffer.length / 1024).toFixed(1)} KB)`);
    const newUrl = await uploadToR2(buffer, uniqueKey, contentType);

    totalMigrated++;
    console.log(`  ✓ Migrated → ${newUrl}`);
    return newUrl;
  } catch (error) {
    totalFailed++;
    console.error(`  ✗ FAILED to migrate ${oldUrl}: ${error.message}`);
    return oldUrl; // Keep old URL on failure so nothing breaks
  }
}

/**
 * Migrate all image URLs in a given collection
 */
async function migrateCollection(Model, modelName, imageFields) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Migrating: ${modelName}`);
  console.log(`${'='.repeat(60)}`);

  const docs = await Model.find({});
  console.log(`Found ${docs.length} documents in ${modelName}`);

  for (const doc of docs) {
    let hasChanges = false;
    console.log(`\n  Processing ${modelName} [${doc._id}]${doc.title ? ` "${doc.title}"` : doc.name ? ` "${doc.name}"` : ''}:`);

    for (const field of imageFields) {
      if (field.type === 'string') {
        // Single image URL field (e.g., imageUrl, avatarUrl, cardImageUrl)
        const oldUrl = doc[field.name];
        if (isCloudinaryUrl(oldUrl)) {
          const newUrl = await migrateImageUrl(oldUrl, `${modelName.toLowerCase()}`);
          if (newUrl !== oldUrl) {
            doc[field.name] = newUrl;
            hasChanges = true;
          }
        } else {
          console.log(`  - ${field.name}: skipped (not Cloudinary)`);
        }
      } else if (field.type === 'array') {
        // Array of image URLs (e.g., gallery: [String])
        const arr = doc[field.name];
        if (arr && arr.length > 0) {
          const newArr = [];
          for (let i = 0; i < arr.length; i++) {
            if (isCloudinaryUrl(arr[i])) {
              const newUrl = await migrateImageUrl(arr[i], `${modelName.toLowerCase()}`);
              newArr.push(newUrl);
              if (newUrl !== arr[i]) hasChanges = true;
            } else {
              newArr.push(arr[i]);
              console.log(`  - ${field.name}[${i}]: skipped (not Cloudinary)`);
            }
          }
          doc[field.name] = newArr;
        }
      }
    }

    if (hasChanges) {
      await doc.save();
      console.log(`  💾 Saved changes for ${modelName} [${doc._id}]`);
    } else {
      console.log(`  — No Cloudinary URLs found, skipping save.`);
    }
  }
}

// --- Main Migration ---
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  Cloudinary → Cloudflare R2 Image Migration Script     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Validate environment
  if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !R2_PUBLIC_URL) {
    console.error('❌ Missing R2 environment variables. Please set:');
    console.error('   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL');
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('❌ Missing MONGO_URI environment variable.');
    process.exit(1);
  }

  // Connect to MongoDB
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected to MongoDB\n');

  // Migrate each collection
  // Trip: imageUrl (string), cardImageUrl (string), gallery (array of strings)
  await migrateCollection(Trip, 'Trip', [
    { name: 'imageUrl', type: 'string' },
    { name: 'cardImageUrl', type: 'string' },
    { name: 'gallery', type: 'array' },
  ]);

  // Blog: imageUrl (string), authorAvatar (string)
  await migrateCollection(Blog, 'Blog', [
    { name: 'imageUrl', type: 'string' },
    { name: 'authorAvatar', type: 'string' },
  ]);

  // Gallery: imageUrl (string)
  await migrateCollection(Gallery, 'Gallery', [
    { name: 'imageUrl', type: 'string' },
  ]);

  // HeroImage: imageUrl (string)
  await migrateCollection(HeroImage, 'HeroImage', [
    { name: 'imageUrl', type: 'string' },
  ]);

  // TeamMember: imageUrl (string)
  await migrateCollection(TeamMember, 'TeamMember', [
    { name: 'imageUrl', type: 'string' },
  ]);

  // Testimonial: avatarUrl (string)
  await migrateCollection(Testimonial, 'Testimonial', [
    { name: 'avatarUrl', type: 'string' },
  ]);

  // --- Summary ---
  console.log(`\n${'='.repeat(60)}`);
  console.log('MIGRATION COMPLETE');
  console.log(`${'='.repeat(60)}`);
  console.log(`  ✓ Migrated:  ${totalMigrated} images`);
  console.log(`  ✗ Failed:    ${totalFailed} images`);
  console.log(`  — Skipped:   ${totalSkipped} (not Cloudinary URLs)`);
  console.log(`${'='.repeat(60)}\n`);

  if (totalFailed > 0) {
    console.log('⚠️  Some images failed to migrate. They still have their old Cloudinary URLs.');
    console.log('   You can re-run this script safely — it will only migrate Cloudinary URLs.');
  }

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB. Done!');
}

main().catch((err) => {
  console.error('Fatal error during migration:', err);
  mongoose.disconnect();
  process.exit(1);
});
