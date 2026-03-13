# Image Guidelines for Wheel to Wilderness

## Trip Image Types

The application now supports two separate image types for each trip:

### 1. Cover/Hero Image (`imageUrl`)
**Purpose:** Main large-format image displayed on the trip detail page header

**Recommended Dimensions:**
- Width: 1920px
- Height: 1080px
- Aspect Ratio: 16:9
- File Format: JPG, PNG, or WEBP
- Max File Size: 5MB

**Usage:**
- Trip detail page hero section (65vh height)
- SEO and social media sharing (Open Graph images)
- Booking confirmations
- Sitemaps

**Guidelines:**
- Use high-quality, landscape-oriented photos
- Ensure the subject is centered or positioned for text overlay
- Avoid excessive text or busy patterns in the center
- Test that the image looks good with dark gradient overlay

---

### 2. Card/Thumbnail Image (`cardImageUrl`) - Optional
**Purpose:** Optimized thumbnail image for trip listing cards

**Recommended Dimensions:**
- Width: 800px
- Height: 600px
- Aspect Ratio: 4:3
- File Format: JPG, PNG, or WEBP
- Max File Size: 5MB

**Usage:**
- Home page trip grid/carousel
- Trip listing pages
- Search results
- Related trips section

**Guidelines:**
- Use a cropped or composed version optimized for card display
- Focus on the main subject with less negative space
- Can be a different angle or composition than the cover image
- Should be eye-catching in a smaller format

**Fallback Behavior:**
- If `cardImageUrl` is not provided, the system automatically uses `imageUrl`
- Existing trips will continue to work without modification
- Optional field allows flexibility in trip management

---

### 3. Gallery Images (`gallery`)
**Purpose:** Additional images shown in the photo gallery section

**Recommended Dimensions:**
- Width: 1200-1600px
- Height: 800-1200px (flexible)
- Aspect Ratio: Flexible (displayed in square crop)
- File Format: JPG, PNG, or WEBP
- Max File Size: 5MB each

**Usage:**
- Photo gallery grid on trip detail page
- Lightbox/modal viewer
- Fallback for trips without dedicated galleries

---

## Image Upload Methods

### Via Admin Panel
1. Navigate to Admin Dashboard → Trips
2. Click "Add New Trip" or Edit an existing trip
3. In the "Media & Details" section:
   - Upload **Cover/Hero Image** (required)
   - Upload **Card/Thumbnail Image** (optional)
   - Add **Gallery Images** (optional, multiple allowed)
4. Each upload supports:
   - Direct file upload (click "Upload Image" button)
   - Paste image URL (manual entry)

### Via Cloudinary Upload API
- Endpoint: `POST /api/upload`
- Authentication: Admin only
- Returns: `{ imageUrl: string }`
- Max file size: 5MB
- Allowed formats: JPEG, PNG, JPG only

---

## Image Optimization Best Practices

### Before Uploading
1. **Resize images** to recommended dimensions to reduce file size
2. **Compress images** using tools like:
   - TinyPNG (https://tinypng.com)
   - ImageOptim (macOS)
   - Squoosh (https://squoosh.app)
3. **Optimize for web** with 80-85% JPEG quality
4. **Use WebP format** when possible for better compression

### Image Composition
- **Cover Images:** Wide landscape shots with strong focal points
- **Card Images:** Tighter compositions that work well at smaller sizes
- **Avoid:** Text overlays, borders, watermarks (except branding)
- **Consider:** Mobile viewing - images should be clear even on small screens

---

## Testing Your Images

### After uploading, verify:
1. ✅ Card image displays correctly in trip listing grid
2. ✅ Cover image displays correctly on trip detail page
3. ✅ Images load quickly (< 2 seconds on standard connection)
4. ✅ Images look good on both desktop and mobile devices
5. ✅ Text overlays are readable over hero images

### Browser Testing
- Test in Chrome, Safari, Firefox, and mobile browsers
- Check responsive behavior at different screen sizes
- Verify image aspect ratios are maintained

---

## Backward Compatibility

### For existing trips:
- All existing trips will continue to work with just `imageUrl`
- No migration required - system automatically falls back to `imageUrl` for cards
- You can optionally add `cardImageUrl` to existing trips for better optimization

### Schema Changes
- `imageUrl`: Required field (existing behavior)
- `cardImageUrl`: Optional field (new feature)
- `gallery`: Optional array (existing behavior)

---

## Troubleshooting

### Issue: Image not displaying
- Check that the URL is accessible (not behind authentication)
- Verify the image format is supported (JPG, PNG, WEBP)
- Ensure the file size is under 5MB

### Issue: Image looks stretched or cropped incorrectly
- Check the aspect ratio matches recommendations
- Resize the source image before uploading
- Consider using the dedicated card image with proper composition

### Issue: Upload failing
- Verify you're logged in as an admin
- Check file size (must be ≤ 5MB)
- Ensure file format is JPEG, PNG, or JPG
- Check browser console for error messages

---

## Examples

### Good Image Choices

**Cover/Hero Image:**
- ✅ Wide panoramic shot of destination
- ✅ Adventure activity with dramatic landscape
- ✅ Sunrise/sunset with strong visual impact
- ✅ Group photo showing scale and excitement

**Card/Thumbnail Image:**
- ✅ Closer crop of main attraction
- ✅ Action shot with clear subject
- ✅ Iconic landmark or feature
- ✅ Compelling composition that works in small format

### Poor Image Choices

**Cover/Hero Image:**
- ❌ Vertical/portrait orientation
- ❌ Busy composition with no clear focal point
- ❌ Low resolution or blurry
- ❌ Too much text overlay

**Card/Thumbnail Image:**
- ❌ Same as cover image without optimization
- ❌ Too much negative space (subject too small)
- ❌ Poor lighting or low contrast
- ❌ Doesn't represent the trip well

---

## Technical Reference

### Database Schema
```javascript
{
  imageUrl: String (required),      // Cover/Hero image
  cardImageUrl: String (optional),  // Card/Thumbnail image
  gallery: [String] (optional)      // Gallery images array
}
```

### React Component Usage
```tsx
// TripCard.tsx
const displayImage = trip.cardImageUrl || trip.imageUrl;

// TripDetails.tsx
<img src={trip.imageUrl} alt={trip.title} />
```

---

**Last Updated:** March 2026
**Version:** 1.0
