# Environment Variables Documentation

This document describes all environment variables required for the Wetowe platform.

## Critical Security Notes

🔴 **NEVER commit the `.env` file to version control**
🔴 **Rotate JWT_SECRET regularly (at least every 90 days)**
🔴 **Use different secrets for development and production**

## Required Environment Variables

### Backend Configuration

#### `MONGO_URI` (Required)
- **Description:** MongoDB connection string
- **Type:** Database Connection String
- **Example:** `mongodb+srv://user:pass@cluster.mongodb.net/?appName=dbname`
- **Where to get:** MongoDB Atlas Dashboard → Connect → Connect your application
- **Production:** Use managed MongoDB Atlas with IP allowlist and strong password

#### `JWT_SECRET` (Required - CRITICAL)
- **Description:** Secret key for signing and verifying JWT tokens
- **Type:** Cryptographically secure random string (minimum 256 bits recommended)
- **Example:** `fdda185000c16a245111e4c8b37e5098...` (128 characters)
- **How to generate:**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **Security Requirements:**
  - Must be at least 64 characters long (512 bits)
  - Must be cryptographically random
  - Must be unique per environment (dev/staging/prod)
  - Must be rotated if compromised or every 90 days
  - Never use default or example values
- **Production:** Store in secure secrets manager (AWS Secrets Manager, Azure Key Vault, etc.)

#### `CLOUDINARY_URL` (Required)
- **Description:** Complete Cloudinary URL with credentials
- **Type:** URL with embedded credentials
- **Format:** `cloudinary://api_key:api_secret@cloud_name`
- **Where to get:** Cloudinary Dashboard → Settings → Access Keys

#### `CLOUDINARY_CLOUD_NAME` (Required)
- **Description:** Your Cloudinary cloud name
- **Where to get:** Cloudinary Dashboard → Settings

#### `CLOUDINARY_API_KEY` (Required)
- **Description:** Your Cloudinary API key
- **Where to get:** Cloudinary Dashboard → Settings → Access Keys

#### `CLOUDINARY_API_SECRET` (Required)
- **Description:** Your Cloudinary API secret
- **Security:** Keep this secret secure
- **Where to get:** Cloudinary Dashboard → Settings → Access Keys

#### `FRONTEND_URL` (Required)
- **Description:** Your frontend application URL (used for CORS configuration)
- **Development:** `http://localhost:5173`
- **Production:** `https://your-domain.com`
- **Purpose:** Allows backend API to accept requests from your frontend

### Frontend Configuration (Vite)

#### `VITE_CLOUDINARY_CLOUD_NAME` (Required)
- **Description:** Cloudinary cloud name for frontend image uploads
- **Note:** Must match CLOUDINARY_CLOUD_NAME
- **Why separate:** Vite exposes VITE_* variables to the browser

#### `VITE_CLOUDINARY_UPLOAD_PRESET` (Required)
- **Description:** Unsigned upload preset for client-side uploads
- **Where to get:** Cloudinary Dashboard → Settings → Upload → Upload presets
- **Setup:** Create an unsigned preset with appropriate restrictions

#### `VITE_GEMINI_API_KEY` (Required)
- **Description:** Google Gemini API key for AI features
- **Where to get:** Google AI Studio → Get API Key
- **Note:** This is exposed to the browser (use API restrictions)

## Environment Setup

### Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Generate a secure JWT_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. Update `.env` with your actual credentials

4. Never commit `.env` file (already in .gitignore)

### Production Setup

#### Option 1: Environment Variables (Recommended)

Set environment variables directly in your hosting platform:

**Vercel/Netlify:**
- Go to Project Settings → Environment Variables
- Add each variable individually
- Use different values for Production/Preview/Development

**Docker:**
```bash
docker run -e JWT_SECRET="your_secret" -e MONGO_URI="your_uri" ...
```

**Traditional Server:**
```bash
export JWT_SECRET="your_secret"
export MONGO_URI="your_uri"
# ... other variables
```

#### Option 2: Secrets Manager (Most Secure)

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret --name wetowe/jwt-secret --secret-string "your_secret"
```

**Azure Key Vault:**
```bash
az keyvault secret set --vault-name your-vault --name jwt-secret --value "your_secret"
```

**Google Secret Manager:**
```bash
gcloud secrets create jwt-secret --data-file=- <<< "your_secret"
```

## Security Best Practices

### JWT_SECRET Security

1. **Length:** Minimum 64 characters (512 bits)
2. **Randomness:** Use cryptographic random number generator
3. **Rotation:** Rotate every 90 days or immediately if compromised
4. **Separation:** Use different secrets for each environment
5. **Storage:** Never hardcode or commit to version control
6. **Access:** Limit access to production secrets to authorized personnel only

### Rotation Procedure

When rotating JWT_SECRET:

1. Generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. Update production environment variable

3. Restart application servers

4. All existing tokens will be invalidated (users need to log in again)

5. Update documentation with rotation date

### Monitoring

- Monitor failed JWT verification attempts
- Alert on unusual authentication patterns
- Log JWT expiration and refresh events
- Track secret rotation dates

## Troubleshooting

### "JWT_SECRET environment variable is not set"
- Ensure .env file exists in project root
- Verify JWT_SECRET is defined in .env
- Restart development server after changes

### Authentication suddenly stops working
- JWT_SECRET may have changed
- Check if .env file was accidentally modified
- Verify environment variables in production

### CORS errors
- Check FRONTEND_URL matches your actual frontend URL
- Ensure no trailing slash in FRONTEND_URL

## Verification Checklist

Before deploying to production:

- [ ] JWT_SECRET is set and is at least 64 characters
- [ ] JWT_SECRET is unique (not the example value)
- [ ] All required environment variables are configured
- [ ] .env file is NOT committed to git
- [ ] Different secrets used for production vs development
- [ ] Secrets are stored securely (secrets manager recommended)
- [ ] FRONTEND_URL matches production domain
- [ ] Cloudinary credentials are valid
- [ ] MongoDB connection string is correct
- [ ] All team members know the rotation procedure

## Last Security Audit

- **Date:** March 15, 2026
- **JWT_SECRET Rotated:** March 15, 2026
- **Next Rotation Due:** June 13, 2026 (90 days)
- **Status:** ✅ Production Ready

## Support

For security concerns or questions about environment configuration:
- Review: `COMPREHENSIVE_SECURITY_AUDIT_2026.md`
- Check: `SECURITY_AUDIT.md`
- Contact: Security team or repository maintainers
