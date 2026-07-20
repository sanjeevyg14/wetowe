
// Upload image via the backend (which now uses Cloudflare R2)
// Function name kept as uploadToCloudinary for backward compatibility with existing call sites
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const API_URL = (import.meta as any)?.env?.VITE_API_URL || '/api';

  const formData = new FormData();
  formData.append('image', file);

  // Include auth token for admin-only upload endpoint
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(text);
      } catch (e) {
        if (response.status === 413 || text.toLowerCase().includes('request entity too large')) {
          throw new Error('Image file is too large. Please compress your image (max 4.5MB).');
        }
        throw new Error(text || `Image upload failed (${response.status})`);
      }
      throw new Error(errorData.message || 'Image upload failed');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error: any) {
    console.error("Image Upload Error:", error);
    throw new Error(error.message || "Failed to upload image");
  }
};
