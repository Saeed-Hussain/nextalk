const NexTalkLogo = ({ className = "w-9 h-9", animated = false }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`${className} ${animated ? "animate-logo-breathe" : ""}`}
  >
    {/* Back bubble - orange */}
    <rect
      x="6"
      y="8"
      width="38"
      height="32"
      rx="10"
      fill="url(#backBubble)"
      opacity="0.6"
    />
    {/* Front bubble - amber */}
    <rect
      x="18"
      y="16"
      width="40"
      height="32"
      rx="10"
      fill="url(#frontBubble)"
    />
    {/* Tail on front bubble */}
    <path
      d="M22 48 L18 56 L30 48"
      fill="url(#frontBubble)"
    />
    {/* Lightning bolt / "Next" arrow inside */}
    <path
      d="M33 24 L28 33 L35 33 L30 42"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />

    <defs>
      <linearGradient id="backBubble" x1="6" y1="8" x2="44" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#ea580c" />
      </linearGradient>
      <linearGradient id="frontBubble" x1="18" y1="16" x2="58" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fbbf24" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
  </svg>
);

export default NexTalkLogo;
