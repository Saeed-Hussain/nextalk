import { respond } from "@/lib/api/respond";
import { requireUser } from "@/lib/api/auth";
import { signCloudinaryUpload, cloudinaryConfig } from "@/lib/cloudinary";

// Purpose determines folder + any incoming transformation, matching what
// the original Express uploadController.js did per-endpoint (uploadImage /
// uploadFile / uploadAudio) — just collapsed into one signer since the
// client now uploads directly to Cloudinary instead of proxying through us.
const PRESETS = {
  avatar: { folder: "nextalk/avatars", transformation: "c_fill,g_face,w_512,h_512,q_auto,f_auto" },
  group_avatar: { folder: "nextalk/group_avatars", transformation: "c_fill,w_512,h_512,q_auto,f_auto" },
  message_image: { folder: "nextalk/images", transformation: "q_auto,f_auto" },
  message_video: { folder: "nextalk/videos" },
  message_audio: { folder: "nextalk/audio" },
  message_document: { folder: "nextalk/docs" },
};

export async function POST(request) {
  const { user } = await requireUser();
  if (!user) return respond(401, "Not authenticated");

  const { purpose } = await request.json();
  const preset = PRESETS[purpose];
  if (!preset) return respond(400, `purpose must be one of: ${Object.keys(PRESETS).join(", ")}`);

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    timestamp,
    folder: preset.folder,
    ...(preset.transformation ? { transformation: preset.transformation } : {}),
  };

  const signature = signCloudinaryUpload(params);

  return respond(200, "Signed", {
    ...params,
    signature,
    api_key: cloudinaryConfig.apiKey,
    cloud_name: cloudinaryConfig.cloudName,
  });
}
