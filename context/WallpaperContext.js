"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_WALLPAPER_ID, getWallpaper } from "@/data/wallpapers";

const WallpaperContext = createContext(null);

// Same SSR-safety concern as ThemeContext: can't read localStorage during
// the initial render on the server, so start with the default and sync
// from localStorage in an effect after mount.
export const WallpaperProvider = ({ children }) => {
  const [wallpaperId, setWallpaperId] = useState(DEFAULT_WALLPAPER_ID);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of localStorage on mount
    setWallpaperId(localStorage.getItem("nextalk-wallpaper") || DEFAULT_WALLPAPER_ID);
  }, []);

  useEffect(() => {
    localStorage.setItem("nextalk-wallpaper", wallpaperId);
  }, [wallpaperId]);

  const wallpaper = getWallpaper(wallpaperId);

  return (
    <WallpaperContext.Provider value={{ wallpaperId, setWallpaperId, wallpaper }}>
      {children}
    </WallpaperContext.Provider>
  );
};

export const useWallpaper = () => {
  const ctx = useContext(WallpaperContext);
  if (!ctx) throw new Error("useWallpaper must be used inside WallpaperProvider");
  return ctx;
};
