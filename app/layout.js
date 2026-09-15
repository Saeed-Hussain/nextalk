import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "NexTalk",
  description: "Connect, collaborate, and communicate seamlessly in real time.",
  applicationName: "NexTalk",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "NexTalk",
    // Lets the app paint behind the iOS status bar, matching the dark shell.
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  // Matches the manifest theme_color so the OS chrome blends with the app.
  themeColor: "#f59e0b",
  width: "device-width",
  initialScale: 1,
  // Keeps the chat UI clear of the iOS home indicator and notch when the app
  // runs standalone.
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
