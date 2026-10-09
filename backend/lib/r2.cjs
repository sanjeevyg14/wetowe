const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// Cloudflare R2 Configuration
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME;

// Ensure all credentials are provided
if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
  console.warn("WARNING: Cloudflare R2 credentials are missing from .env. Uploads will fail.");
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || '',
  },
});

const r2Storage = multerS3({
  s3: s3Client,
  bucket: bucketName || 'wheel-to-wilderness',
  // omit ACL for R2 as it does not support it by default
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use the original extension
    const ext = file.originalname.split('.').pop();
    cb(null, `uploads/${uniqueSuffix}.${ext}`);
  }
});

module.exports = { s3Client, r2Storage };
