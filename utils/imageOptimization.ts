/**
 * Rewrites an image URL to use the free wsrv.nl image proxy for on-the-fly resizing and WebP conversion.
 * 
 * @param url The original absolute image URL (e.g., from Cloudflare R2 or Cloudinary).
 * @param width The target width in pixels.
 * @returns The optimized URL, or the original URL if it cannot be optimized.
 */
export const getOptimizedImageUrl = (url: string | undefined, width: number): string => {
  if (!url) return '';
  
  // Don't proxy data URIs, local SVG/PNG paths, or already proxied images
  if (url.startsWith('data:') || url.startsWith('/') || url.includes('wsrv.nl')) {
    return url;
  }

  try {
    // wsrv.nl prefers URLs without the protocol, but encodeURIComponent(url) also works.
    const encodedUrl = encodeURIComponent(url);
    // q=80 for good compression, output=webp for next-gen format
    return `https://wsrv.nl/?url=${encodedUrl}&w=${width}&output=webp&q=80`;
  } catch (e) {
    // Fallback to original URL if anything goes wrong
    return url;
  }
};
