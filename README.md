<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UWK-sJ8H5LrA8BpoVsqd_-ye9_andPsm

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then update `.env` with your actual credentials. See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for detailed configuration instructions.

3. Run the app:
   ```bash
   npm run dev
   ```

## 🔒 Environment Configuration

This application requires several environment variables to be configured:

- **JWT_SECRET** - Secure token for authentication (generate with crypto.randomBytes)
- **MONGO_URI** - MongoDB connection string
- **CLOUDINARY_*** - Image upload service credentials
- **VITE_GEMINI_API_KEY** - AI API key

For complete environment variable documentation, see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

For production deployment checklist, see [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md).

## 📸 Image Management

The application supports separate, optimized images for different contexts:

- **Cover/Hero Image** (1920x1080px, 16:9): Large format image for trip detail pages
- **Card/Thumbnail Image** (800x600px, 4:3): Optimized smaller image for listing cards
- **Gallery Images** (1200-1600px, flexible): Additional photos for trip galleries

For detailed image upload guidelines and best practices, see [IMAGE_GUIDELINES.md](IMAGE_GUIDELINES.md).

For technical implementation details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).
