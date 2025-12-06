
export const uploadToCloudinary = async (file: File): Promise<string> => {
  // Access environment variables
  // Note: In Vite, env vars must start with VITE_ to be exposed to the client
  const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Image upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error(error.message || "Failed to upload image");
  }
};
