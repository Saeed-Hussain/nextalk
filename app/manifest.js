// Served at /manifest.webmanifest by Next's metadata route handler, so there
// is no static file in public/ to keep in sync with the app metadata.
export default function manifest() {
  return {
    name: "NexTalk",
    short_name: "NexTalk",
    description:
      "Connect, collaborate, and communicate seamlessly in real time.",
    // Installed users almost always want the chat, not the marketing page.
    // Unauthenticated visitors get bounced to /login by the proxy anyway.
    start_url: "/chat",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f0e0d",
    theme_color: "#f59e0b",
    categories: ["social", "communication"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png", purpose: "any" },
      { src: "/icons/icon-384.png", sizes: "384x384", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "New chat", short_name: "New chat", url: "/chat/new", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "New group", short_name: "New group", url: "/chat/new-group", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Starred", short_name: "Starred", url: "/chat/starred", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
