"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

// Next.js renders this on the server first, where `localStorage`/`window`
// don't exist — so unlike the Vite version, we can't read localStorage in
// the initial useState(). We start with a safe default and sync it in an
// effect after mount instead (this also avoids a hydration mismatch).
export const ThemeProvider = ({ children }) => {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // One-time read of an external system (localStorage/matchMedia) on
    // mount; there's no way to know the user's saved theme during server
    // rendering, so we can't set this via a lazy useState initializer.
    const saved = localStorage.getItem("nextalk-theme");
    const initial = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("nextalk-theme", dark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark, mounted]);

  const toggle = () => setDark((d) => !d);
  const t = (darkVal, lightVal) => (dark ? darkVal : lightVal);

  return (
    <ThemeContext.Provider value={{ dark, toggle, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
