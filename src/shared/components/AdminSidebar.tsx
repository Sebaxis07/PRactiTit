"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAdminAction } from "@/features/auth/actions/auth";

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const modulosOperacion = [
    { label: "Dashboard", href: "/admin", icon: "▦", desc: "Resumen general" },
    { label: "Reservas & Ocupación", href: "/admin/reservas", icon: "◫", desc: "Calendario y check-ins" },
    { label: "Habitaciones", href: "/admin/habitaciones", icon: "⊞", desc: "Estado de las piezas" },
    { label: "Cocina & Comidas", href: "/admin/cocina", icon: "◈", desc: "Raciones y minuta diaria" },
  ];

  const modulosGestion = [
    { label: "Reportes & Facturación", href: "/admin/reportes", icon: "↗", desc: "Métricas e ingresos" },
    { label: "Configuración", href: "/admin/configuracion", icon: "⊙", desc: "Ajustes del sistema" },
  ];

  return (
    <>
      {/* ── BARRA MÓVIL (< 1024px) ─────────────────────────── */}
      <div className="lg:hidden w-full sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: "#2A2418", borderBottom: "1px solid rgba(255,250,241,0.08)" }}>
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl grid place-items-center text-white font-serif font-bold text-lg"
            style={{ background: "#D9583B" }}>M</div>
          <span className="text-sm font-serif font-bold" style={{ color: "#FFFAF1" }}>Panel Admin</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            background: mobileMenuOpen ? "#D9583B" : "rgba(255,250,241,0.08)",
            color: "#FFFAF1",
            border: "1px solid rgba(255,250,241,0.12)"
          }}
        >
          {mobileMenuOpen ? "✕ Cerrar" : "☰ Menú"}
        </button>
      </div>

      {/* ── SIDEBAR PRINCIPAL ─────────────────────────────────── */}
      <aside
        className={`${mobileMenuOpen ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-72 shrink-0 lg:min-h-screen`}
        style={{ background: "#2A2418" }}
      >
        {/* Padding interior */}
        <div className="flex flex-col h-full p-5 space-y-6">

          {/* ── BRAND ──────────────────────────────── */}
          <div className="hidden lg:block">
            <Link href="/admin" className="block mb-3">
              <Image
                src="/images/logo.png"
                alt="Pensión Señora Myriam"
                width={180}
                height={56}
                className="h-11 w-auto object-contain brightness-0 invert opacity-90"
                priority
              />
            </Link>
            {/* Status pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{ background: "rgba(30,173,80,0.12)", border: "1px solid rgba(30,173,80,0.25)" }}>
              <span className="w-2 h-2 rounded-full bg-cactus animate-pulse flex-shrink-0" />
              <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: "#1EAD50" }}>
                Sistema en línea
              </span>
            </div>
          </div>

          {/* ── SECCIÓN: OPERACIÓN DIARIA ─────────── */}
          <nav className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
              style={{ color: "rgba(255,250,241,0.35)" }}>
              Operación Diaria
            </p>
            {modulosOperacion.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group"
                  style={{
                    background: isActive ? "#D9583B" : "transparent",
                    color: isActive ? "#FFFAF1" : "rgba(255,250,241,0.65)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,250,241,0.07)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <span className="w-8 h-8 rounded-lg grid place-items-center text-base flex-shrink-0 transition-all"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,250,241,0.07)",
                      color: isActive ? "#fff" : "rgba(255,250,241,0.5)"
                    }}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate"
                      style={{ color: isActive ? "#fff" : "rgba(255,250,241,0.85)" }}>
                      {item.label}
                    </div>
                    <div className="text-[10px] truncate mt-0.5"
                      style={{ color: isActive ? "rgba(255,255,255,0.65)" : "rgba(255,250,241,0.35)" }}>
                      {item.desc}
                    </div>
                  </div>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── DIVISOR ───────────────────────────── */}
          <div style={{ height: "1px", background: "rgba(255,250,241,0.08)" }} />

          {/* ── SECCIÓN: GESTIÓN & REPORTES ──────── */}
          <nav className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 mb-3"
              style={{ color: "rgba(255,250,241,0.35)" }}>
              Gestión & Reportes
            </p>
            {modulosGestion.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{
                    background: isActive ? "#D9583B" : "transparent",
                    color: isActive ? "#FFFAF1" : "rgba(255,250,241,0.65)",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,250,241,0.07)";
                  }}
                  onMouseLeave={e => {
                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  <span className="w-8 h-8 rounded-lg grid place-items-center text-base flex-shrink-0"
                    style={{
                      background: isActive ? "rgba(255,255,255,0.18)" : "rgba(255,250,241,0.07)",
                      color: isActive ? "#fff" : "rgba(255,250,241,0.5)"
                    }}>
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm leading-tight truncate"
                      style={{ color: isActive ? "#fff" : "rgba(255,250,241,0.85)" }}>
                      {item.label}
                    </div>
                    <div className="text-[10px] truncate mt-0.5"
                      style={{ color: isActive ? "rgba(255,255,255,0.65)" : "rgba(255,250,241,0.35)" }}>
                      {item.desc}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* ── PORTAL HUÉSPEDES ──────────────────── */}
          <div className="rounded-2xl p-3.5 space-y-2"
            style={{ background: "rgba(217,88,59,0.1)", border: "1px solid rgba(217,88,59,0.2)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: "#FFFAF1" }}>Portal Huéspedes</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded"
                style={{ background: "rgba(217,88,59,0.25)", color: "#D9583B" }}>
                /mi-reserva
              </span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,250,241,0.45)" }}>
              Código de consulta para huéspedes en tiempo real.
            </p>
            <Link
              href="/mi-reserva"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="text-[11px] font-semibold hover:underline inline-flex items-center gap-1"
              style={{ color: "#D9583B" }}
            >
              Ver portal ↗
            </Link>
          </div>

          {/* ── SPACER ────────────────────────────── */}
          <div className="flex-1" />

          {/* ── FOOTER: USUARIO + LOGOUT ──────────── */}
          <div className="space-y-2 pt-4" style={{ borderTop: "1px solid rgba(255,250,241,0.08)" }}>
            {/* Ver sitio público */}
            <Link
              href="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: "rgba(255,250,241,0.07)",
                color: "rgba(255,250,241,0.55)",
                border: "1px solid rgba(255,250,241,0.08)"
              }}
            >
              <span>🌐 Ver Sitio Público</span>
              <span>↗</span>
            </Link>

            {/* Tarjeta de usuario */}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ background: "rgba(255,250,241,0.06)", border: "1px solid rgba(255,250,241,0.1)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl grid place-items-center font-serif font-bold text-sm flex-shrink-0"
                  style={{ background: "#D9583B", color: "#fff" }}>
                  M
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight" style={{ color: "#FFFAF1" }}>
                    Sra. Myriam
                  </div>
                  <div className="text-[10px]" style={{ color: "rgba(255,250,241,0.4)" }}>
                    Administradora
                  </div>
                </div>
              </div>
              <button
                onClick={async () => {
                  await logoutAdminAction();
                  window.location.href = "/admin";
                }}
                className="p-2 rounded-lg text-xs transition-all"
                title="Cerrar Sesión"
                style={{ color: "rgba(255,100,80,0.7)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.15)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                🚪
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
