"use client";

import { useEffect, useState } from "react";
import { Camera, AtSign, User, FileText, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api/client";
import { avatarColor } from "@/lib/avatarColor";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import Avatar from "@/components/chat/Avatar";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
};

export default function EditProfile() {
  const { t } = useTheme();
  const { user, profile, setProfile } = useUser();

  const [displayName, setDisplayName] = useState("");
  const [about, setAbout] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local edit state once the profile loads from context
    setDisplayName(profile.display_name || "");
    setAbout(profile.about || "");
    setUsername(profile.username || "");
    setAvatarUrl(profile.avatar_url || null);
  }, [profile]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    setUploadingAvatar(true);
    try {
      const uploaded = await uploadToCloudinary(file, "avatar");
      const res = await api.put("/users/me", { avatar_url: uploaded.url });
      setAvatarUrl(uploaded.url);
      setProfile((p) => ({ ...p, avatar_url: res.data.avatar_url }));
      toast.success("Profile photo updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const saveDetails = async () => {
    setSaving(true);
    try {
      const res = await api.put("/users/me", {
        display_name: displayName.trim(),
        about: about.trim(),
      });
      setProfile((p) => ({ ...p, ...res.data }));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveUsername = async () => {
    if (username === profile?.username) return;
    setSavingUsername(true);
    try {
      const res = await api.put("/users/me/username", { username: username.trim() });
      setProfile((p) => ({ ...p, username: res.data.username }));
      toast.success("Username updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingUsername(false);
    }
  };

  return (
    <ChatShell active="settings" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar title="Edit profile" />

        <div className="flex justify-center py-8">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              id="edit-avatar-input"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label htmlFor="edit-avatar-input" className="block cursor-pointer">
              <Avatar
                initials={getInitials(displayName || profile?.username)}
                color={avatarColor(user?.id)}
                avatarUrl={avatarUrl}
                size="xl"
              />
              <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 flex items-center justify-center ${t("bg-stone-800 border-stone-950", "bg-white border-stone-50")}`}>
                {uploadingAvatar ? (
                  <div className="w-3.5 h-3.5 border-2 border-stone-400/40 border-t-stone-500 rounded-full animate-spin" />
                ) : (
                  <Camera className={`w-4 h-4 ${t("text-stone-400", "text-stone-500")}`} />
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="px-4 space-y-5 max-w-md mx-auto">
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${t("text-stone-400", "text-stone-500")}`}>
              <User className="w-3.5 h-3.5" /> Display name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={saveDetails}
              maxLength={60}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none ${t(
                "bg-white/5 text-stone-200",
                "bg-white border border-stone-200 text-stone-800"
              )}`}
            />
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${t("text-stone-400", "text-stone-500")}`}>
              <FileText className="w-3.5 h-3.5" /> About
            </label>
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              onBlur={saveDetails}
              maxLength={140}
              rows={2}
              className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none ${t(
                "bg-white/5 text-stone-200",
                "bg-white border border-stone-200 text-stone-800"
              )}`}
            />
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${t("text-stone-400", "text-stone-500")}`}>
              <AtSign className="w-3.5 h-3.5" /> Username
            </label>
            <div className="flex gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                maxLength={15}
                className={`flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none ${t(
                  "bg-white/5 text-stone-200",
                  "bg-white border border-stone-200 text-stone-800"
                )}`}
              />
              <button
                onClick={saveUsername}
                disabled={savingUsername || username === profile?.username}
                className="px-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-sm font-medium cursor-pointer transition-colors"
              >
                {savingUsername ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {saving && (
            <p className={`text-xs ${t("text-stone-500", "text-stone-400")}`}>Saving...</p>
          )}
        </div>
      </div>
    </ChatShell>
  );
}
