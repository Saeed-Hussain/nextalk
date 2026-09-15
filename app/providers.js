"use client";

import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { PresenceProvider } from "@/context/PresenceContext";
import { WallpaperProvider } from "@/context/WallpaperContext";
import ServiceWorkerRegistrar from "@/components/pwa/ServiceWorkerRegistrar";
import InstallPrompt from "@/components/pwa/InstallPrompt";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <PresenceProvider>
          <WallpaperProvider>
            <ServiceWorkerRegistrar />
            {children}
            <InstallPrompt />
            <Toaster
              position="top-center"
              gutter={8}
              toastOptions={{
                duration: 2500,
                style: {
                  borderRadius: "14px",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  fontWeight: 500,
                  maxWidth: "360px",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.25)",
                },
              }}
            />
          </WallpaperProvider>
        </PresenceProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
