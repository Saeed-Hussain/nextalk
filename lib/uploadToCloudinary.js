"use client";

import { api } from "@/lib/api/client";

const RESOURCE_TYPE = {
  avatar: "image",
  group_avatar: "image",
  message_image: "image",
  message_video: "video",
  message_audio: "video", // Cloudinary uses 'video' resource_type for audio too
  message_document: "raw",
};

// Client-side size guard matching this Cloudinary account's actual limits
// (checked via the Cloudinary MCP connector while building this) — fails
// fast with a friendly message instead of a slow upload that Cloudinary
// rejects anyway.
const MAX_BYTES = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
  raw: 10 * 1024 * 1024,
};

export async function uploadToCloudinary(file, purpose, onProgress) {
  const resourceType = RESOURCE_TYPE[purpose];
  if (!resourceType) throw new Error(`Unknown upload purpose: ${purpose}`);

  const max = MAX_BYTES[resourceType];
  if (file.size > max) {
    throw new Error(`File is too large (max ${Math.round(max / 1024 / 1024)}MB for this file type)`);
  }

  const signRes = await api.post("/uploads/sign", { purpose });
  const { timestamp, folder, transformation, signature, api_key, cloud_name } = signRes.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", api_key);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("folder", folder);
  if (transformation) formData.append("transformation", transformation);

  const result = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(body);
        else reject(new Error(body?.error?.message || "Upload failed"));
      } catch {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
    xhr.send(formData);
  });

  return {
    url: result.secure_url,
    public_id: result.public_id,
    format: result.format,
    file_type: file.type,
    width: result.width,
    height: result.height,
    duration: result.duration,
    bytes: result.bytes,
  };
}
