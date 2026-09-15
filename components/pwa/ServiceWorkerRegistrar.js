"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

// Registers the worker and surfaces updates. Rendered once from Providers.
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Registering in dev would serve cached build output across restarts and
    // make hot reload look broken, so it is production-only.
    if (process.env.NODE_ENV !== "production") return;

    let registration;

    const promptForUpdate = (worker) => {
      toast(
        (t) => (
          <span className="flex items-center gap-3">
            A new version is available.
            <button
              type="button"
              onClick={() => {
                toast.dismiss(t.id);
                worker.postMessage("SKIP_WAITING");
              }}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold"
            >
              Reload
            </button>
          </span>
        ),
        { duration: 10000 }
      );
    };

    const onRegistered = (reg) => {
      registration = reg;

      // A worker already waiting means the tab was open across a deploy.
      if (reg.waiting && navigator.serviceWorker.controller) promptForUpdate(reg.waiting);

      reg.addEventListener("updatefound", () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          // With no controller this is the very first install, not an
          // update, and prompting to reload would be nonsense.
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            promptForUpdate(installing);
          }
        });
      });
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(onRegistered)
      .catch(() => {
        // A failed registration only costs offline support, so it stays
        // silent rather than throwing an error at the user.
      });

    // The new worker calls clients.claim(), which fires this once it is in
    // control. Reload here so the page matches the build that is now cached.
    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Catches deploys that happen while a long-lived chat tab stays open.
    const interval = setInterval(() => registration?.update(), 60 * 60 * 1000);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      clearInterval(interval);
    };
  }, []);

  return null;
}
