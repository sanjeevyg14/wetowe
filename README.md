<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1UWK-sJ8H5LrA8BpoVsqd_-ye9_andPsm

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## 📸 Image Management

The application supports separate, optimized images for different contexts:

- **Cover/Hero Image** (1920x1080px, 16:9): Large format image for trip detail pages
- **Card/Thumbnail Image** (800x600px, 4:3): Optimized smaller image for listing cards
- **Gallery Images** (1200-1600px, flexible): Additional photos for trip galleries

For detailed image upload guidelines and best practices, see [IMAGE_GUIDELINES.md](IMAGE_GUIDELINES.md).

For technical implementation details, see [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md).
