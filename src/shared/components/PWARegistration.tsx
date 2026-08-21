"use client";

import { useEffect } from "react";

export function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.location.protocol === "https:" || window.location.hostname === "localhost"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[PWA] Service Worker registrado con éxito en scope:", registration.scope);
          })
          .catch((error) => {
            console.error("[PWA] Fallo al registrar el Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
}
