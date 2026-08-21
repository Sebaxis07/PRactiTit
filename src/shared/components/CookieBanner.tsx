"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const COOKIE_CONSENT_KEY = "pm_cookie_consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Pequeño delay para una entrada suave tras cargar la página
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // Escucha para reabrir preferencias desde el footer u otro enlace
  useEffect(() => {
    const handleReopen = () => setIsVisible(true);
    window.addEventListener("open-cookie-settings", handleReopen);
    return () => window.removeEventListener("open-cookie-settings", handleReopen);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "essential");
    setIsVisible(false);
  };

  if (!mounted || !isVisible) return null;

  return (
    <aside
      aria-label="Consentimiento de cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-card/95 backdrop-blur-md border border-sand-border shadow-2xl rounded-3xl p-5 sm:p-6 text-ink relative">
        {/* Botón cerrar discreto */}
        <button
          onClick={handleEssentialOnly}
          aria-label="Cerrar y aceptar solo esenciales"
          className="absolute top-4 right-4 text-[#7A6F5A] hover:text-ink transition-colors p-1 rounded-full hover:bg-sand-deep/40 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          <div className="w-10 h-10 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center shrink-0 shadow-xs">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm sm:text-base text-ink">
              Uso de Cookies y Privacidad
            </h3>
            <p className="text-xs text-[#7A6F5A] leading-relaxed">
              Utilizamos cookies técnicas y almacenamiento local para garantizar el funcionamiento seguro de las reservas y el soporte sin conexión. No vendemos ni rastreamos tus datos para publicidad.
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-sand-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <Link
            href="/terminos#cookies"
            className="text-[11px] font-semibold text-terracotta hover:underline text-center sm:text-left self-center sm:self-auto py-1"
          >
            Ver política detallada →
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleEssentialOnly}
              className="flex-1 sm:flex-initial text-xs font-semibold px-3.5 py-2 rounded-full border border-sand-border bg-sand/30 hover:bg-sand-deep text-ink transition-all cursor-pointer"
            >
              Solo esenciales
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 sm:flex-initial text-xs font-semibold px-4 py-2 rounded-full bg-terracotta hover:bg-terracotta-deep text-white shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
