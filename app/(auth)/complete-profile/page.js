"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AtSign,
  User,
  FileText,
  ChevronDown,
  ArrowRight,
  SkipForward,
  Sparkles,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { uploadToCloudinary } from "@/lib/uploadToCloudinary";
import NexTalkLogo from "@/components/NexTalkLogo";

const getInitials = (name) => {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
};

const GENDER_OPTIONS = [
  { value: "not_selected",     label: "Select gender" },
  { value: "male",             label: "Male" },
  { value: "female",           label: "Female" },
  { value: "other",            label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export default function CompleteProfile() {
  const router = useRouter();
  const supabase = createClient();
  const [authUser, setAuthUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [username, setUsername]       = useState("");
  const [displayName, setDisplayName] = useState("");
  const [about, setAbout]             = useState("");
  const [gender, setGender]           = useState("not_selected");
  const [avatarUrl, setAvatarUrl]     = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setAuthUser(user);

      // Pre-fill display_name from OAuth metadata if available
      const meta = user.user_metadata ?? {};
      const metaName = meta.full_name || meta.name || "";
      if (metaName) setDisplayName(metaName);

      // If profile already exists, pre-fill fields (user coming back to edit)
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.username)     setUsername(profile.username);
        if (profile.display_name) setDisplayName(profile.display_name);
        if (profile.about)        setAbout(profile.about);
        if (profile.gender)       setGender(profile.gender);
        if (profile.avatar_url)   setAvatarUrl(profile.avatar_url);
      }

      setInitializing(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setUploadingAvatar(true);
    setError("");
    try {
      const uploaded = await uploadToCloudinary(file, "avatar");
      setAvatarUrl(uploaded.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validate = () => {
    const u = username.trim();
    if (!u) return "Username is required.";
    if (u.length < 3) return "Username must be at least 3 characters.";
    if (!/^[a-zA-Z0-9_.]+$/.test(u))
      return "Username can only contain letters, numbers, dots, and underscores.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    setError("");

    const { error: upsertError } = await supabase.from("profiles").upsert({
      id:           authUser.id,
      username:     username.trim().toLowerCase(),
      display_name: displayName.trim() || null,
      about:        about.trim() || null,
      gender,
      avatar_url:   avatarUrl,
    });

    if (upsertError) {
      if (upsertError.code === "23505" || upsertError.message?.includes("unique")) {
        setError("This username is already taken. Try another one.");
      } else {
        setError(upsertError.message);
      }
      setSaving(false);
      return;
    }

    router.push("/chat");
  };

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20" />
          <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-transparent border-t-amber-400 animate-spin" />
        </div>
      </div>
    );
  }

  const avatarInitials = getInitials(displayName);

  return (
    <div className="min-h-screen flex">
      {/* ─── Left panel — branding + live preview ─── */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-[440px] relative bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 flex-col items-center justify-center p-12 overflow-hidden shrink-0">
        {/* Background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-amber-500/8 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-[-10%] right-[-5%] w-72 h-72 bg-amber-600/5 rounded-full blur-3xl animate-float" />

        <div className="relative z-10 w-full max-w-xs">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <NexTalkLogo className="w-20 h-20" animated />
          </div>

          <div className="flex items-center gap-2 mb-2 justify-center">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Profile Setup
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white text-center leading-tight mb-3">
            Make it{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
              yours
            </span>
          </h1>
          <p className="text-stone-400 text-sm text-center leading-relaxed mb-10">
            A complete profile helps your teammates find and recognise you across NexTalk.
          </p>

          {/* Live profile preview card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-4">
              Live preview
            </p>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <span className="text-stone-900 font-bold text-sm select-none">
                  {avatarInitials}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {displayName.trim() || "Your Name"}
                </p>
                <p className="text-stone-400 text-xs truncate">
                  {username.trim() ? `@${username.trim().toLowerCase()}` : "@username"}
                </p>
              </div>
            </div>

            {about.trim() && (
              <p className="mt-3 text-stone-300 text-xs leading-relaxed border-t border-white/8 pt-3 line-clamp-3">
                {about.trim()}
              </p>
            )}

            {gender !== "not_selected" && (
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-stone-400 border border-white/10 capitalize">
                  {GENDER_OPTIONS.find((g) => g.value === gender)?.label}
                </span>
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-stone-600">
            You can always update this later in Settings.
          </p>
        </div>
      </div>

      {/* ─── Right panel — form ─── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-white">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <NexTalkLogo className="w-10 h-10" />
          </div>
          <div className="hidden lg:block" />

          <button
            onClick={() => router.push("/chat")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all duration-200 cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
            Skip for now
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12 pt-4">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-stone-900">Complete your profile</h2>
              <p className="text-stone-500 mt-2 text-sm">
                This is optional — you can skip and fill in the details later.
              </p>
            </div>

            {/* Avatar display */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="avatar-upload-input"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <label htmlFor="avatar-upload-input" className="block cursor-pointer">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, remote
                    <img
                      src={avatarUrl}
                      alt="Your avatar"
                      className="w-20 h-20 rounded-full object-cover shadow-lg shadow-amber-500/25"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                      <span className="text-stone-900 font-bold text-xl select-none">
                        {avatarInitials}
                      </span>
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center">
                    {uploadingAvatar ? (
                      <div className="w-3 h-3 border-2 border-stone-400/40 border-t-stone-600 rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-stone-400" />
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="your_handle"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200"
                    autoComplete="username"
                  />
                </div>
                <p className="mt-1 text-[11px] text-stone-400">
                  Letters, numbers, dots and underscores only. Min 3 characters.
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="How should we call you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200"
                  />
                </div>
              </div>

              {/* About / Bio */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  About
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-5 h-5 text-stone-400" />
                  <textarea
                    placeholder="A short bio about yourself..."
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={3}
                    maxLength={160}
                    className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-stone-300 select-none">
                    {about.length}/160
                  </span>
                </div>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Gender
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full appearance-none pl-11 pr-10 py-3 border border-stone-200 rounded-xl text-stone-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all duration-200 cursor-pointer"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-amber-500/20"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Save & continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-stone-400">
              Not ready?{" "}
              <button
                onClick={() => router.push("/chat")}
                className="text-amber-600 hover:text-amber-700 font-medium transition-colors cursor-pointer"
              >
                Skip and set up later
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
