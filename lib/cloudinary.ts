import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64String: string): Promise<string> {
  const dataUri = base64String.startsWith("data:")
    ? base64String
    : `data:image/png;base64,${base64String}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "utensil-store",
    resource_type: "image",
  });

  return result.secure_url;
}

export { cloudinary };
