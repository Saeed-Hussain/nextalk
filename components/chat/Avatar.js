"use client";

import { useTheme } from "@/context/ThemeContext";

const sizes = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-9 h-9 text-xs",
  md: "w-11 h-11 text-sm",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
};

const dotSizes = {
  xs: "w-2 h-2",
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
  xl: "w-5 h-5",
};

const statusBg = {
  online: "bg-green-500",
  away: "bg-amber-400",
  offline: "bg-stone-400",
};

const Avatar = ({
  initials = "?",
  color = "from-amber-400 to-orange-500",
  avatarUrl = null,
  size = "md",
  status = null,
  className = "",
}) => {
  const { t } = useTheme();
  return (
    <div className={`relative shrink-0 ${className}`}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary-hosted, remote, variable dimensions
        <img
          src={avatarUrl}
          alt={initials}
          className={`rounded-full object-cover ${sizes[size]}`}
        />
      ) : (
        <div
          className={`rounded-full bg-gradient-to-br ${color} flex items-center justify-center font-bold text-white ${sizes[size]}`}
        >
          {initials}
        </div>
      )}
      {status && (
        <div
          className={`absolute -bottom-0.5 -right-0.5 ${dotSizes[size]} rounded-full border-2 ${statusBg[status]} ${t("border-stone-900", "border-white")}`}
        />
      )}
    </div>
  );
};

export default Avatar;
