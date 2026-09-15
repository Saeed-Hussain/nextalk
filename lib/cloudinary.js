import { createHash } from "crypto";

// Signs upload parameters the way Cloudinary's SDK does, without pulling in
// the whole cloudinary npm package just for this one thing. Algorithm per
// Cloudinary's docs: sort all params alphabetically, join as key=value&...,
// append the API secret, SHA-1 hash the result.
export function signCloudinaryUpload(params) {
  const sorted = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== "")
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  const toSign = `${sorted}${process.env.CLOUDINARY_API_SECRET}`;
  return createHash("sha1").update(toSign).digest("hex");
}

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
};
