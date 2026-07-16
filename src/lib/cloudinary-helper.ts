import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a base64 image string to Cloudinary and returns the secure URL.
 * If the string is already a URL (not base64), it returns it as-is.
 */
export async function uploadToCloudinary(
  base64Data: string | undefined | null,
  folder: string = "mp_portal"
): Promise<string> {
  if (!base64Data) return "";
  
  const trimmed = base64Data.trim();
  if (!trimmed.startsWith("data:image")) {
    return trimmed;
  }

  try {
    const result = await cloudinary.uploader.upload(trimmed, {
      folder,
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}
