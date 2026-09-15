"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ShieldOff, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { api } from "@/lib/api/client";
import ChatTopBar from "@/components/chat/ChatTopBar";
import ChatShell from "@/components/chat/ChatShell";
import BottomSheet, { SheetItem } from "@/components/chat/BottomSheet";

const PRIVACY_FIELDS = [
  { key: "last_seen_privacy", label: "Last seen & online", desc: "Who can see your last seen and online status" },
  { key: "profile_photo_privacy", label: "Profile photo", desc: "Who can see your profile photo" },
  { key: "about_privacy", label: "About", desc: "Who can see your About info" },
  { key: "read_receipts_privacy", label: "Read receipts", desc: "Whether others see when you read messages" },
];

const OPTIONS = [
  { id: "everyone", label: "Everyone" },
  { id: "contacts", label: "My contacts" },
  { id: "nobody", label: "Nobody" },
];

export default function PrivacySettings() {
  const { t } = useTheme();
  const router = useRouter();
  const { profile, setProfile } = useUser();
  const [privacy, setPrivacy] = useState({
    last_seen_privacy: "everyone",
    profile_photo_privacy: "everyone",
    about_privacy: "everyone",
    read_receipts_privacy: "everyone",
  });
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync local edit state once the profile loads from context
    setPrivacy({
      last_seen_privacy: profile.last_seen_privacy || "everyone",
      profile_photo_privacy: profile.profile_photo_privacy || "everyone",
      about_privacy: profile.about_privacy || "everyone",
      read_receipts_privacy: profile.read_receipts_privacy || "everyone",
    });
  }, [profile]);

  const labelFor = (val) => OPTIONS.find((o) => o.id === val)?.label;

  const handleSelect = async (option) => {
    const field = editing;
    setPrivacy((p) => ({ ...p, [field.key]: option.id }));
    setEditing(null);
    setSaving(true);
    try {
      const res = await api.put("/users/me/privacy", { [field.key]: option.id });
      setProfile((p) => ({ ...p, ...res.data }));
    } catch (err) {
      toast.error(err.message);
      // revert on failure
      setPrivacy((p) => ({ ...p, [field.key]: profile?.[field.key] || "everyone" }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ChatShell active="settings" fullWidth>
      <div className={`min-h-screen ${t("bg-stone-950 text-stone-100", "bg-stone-50 text-stone-900")}`}>
        <ChatTopBar title="Privacy" />

        <p className={`px-4 pt-4 text-xs ${t("text-stone-400", "text-stone-500")}`}>
          Control who can see your information. Read receipts are always shown for groups.
        </p>

        <div className={`mt-3 ${t("bg-stone-900/40", "bg-white")} divide-y ${t("divide-white/5", "divide-stone-100")}`}>
          {PRIVACY_FIELDS.map((f) => (
            <button
              key={f.key}
              onClick={() => setEditing(f)}
              disabled={saving}
              className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer disabled:opacity-60 ${t("hover:bg-white/5", "hover:bg-stone-50")}`}
            >
              <div className="flex-1 text-left min-w-0">
                <p className={`text-sm ${t("text-stone-100", "text-stone-900")}`}>{f.label}</p>
                <p className={`text-xs ${t("text-stone-400", "text-stone-500")}`}>
                  {labelFor(privacy[f.key])}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 ${t("text-stone-600", "text-stone-300")}`} />
            </button>
          ))}
        </div>

        <div className={`mt-3 ${t("bg-stone-900/40", "bg-white")}`}>
          <button
            onClick={() => router.push("/chat/blocked")}
            className={`w-full flex items-center gap-3 px-4 py-3 cursor-pointer ${t("hover:bg-white/5", "hover:bg-stone-50")}`}
          >
            <ShieldOff className={`w-5 h-5 ${t("text-stone-400", "text-stone-500")}`} />
            <div className="flex-1 text-left">
              <p className={`text-sm ${t("text-stone-100", "text-stone-900")}`}>Blocked contacts</p>
            </div>
            <ChevronRight className={`w-4 h-4 ${t("text-stone-600", "text-stone-300")}`} />
          </button>
        </div>

        <BottomSheet open={!!editing} onClose={() => setEditing(null)} title={editing?.label}>
          {editing && (
            <p className={`px-5 pb-2 text-xs ${t("text-stone-400", "text-stone-500")}`}>{editing.desc}</p>
          )}
          {OPTIONS.map((o) => (
            <SheetItem
              key={o.id}
              icon={privacy[editing?.key] === o.id ? Check : null}
              label={o.label}
              onClick={() => handleSelect(o)}
            />
          ))}
        </BottomSheet>
      </div>
    </ChatShell>
  );
}
