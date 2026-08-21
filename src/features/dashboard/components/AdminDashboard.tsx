"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DashboardKPIs } from "../services/dashboard";
import { cambiarEstadoReserva } from "@/features/reservas/actions/admin-reservas";
import { formatDateCL, getEstadoReservaBadge } from "@/shared/utils/formatters";

// Carga diferida no bloqueante de Recharts para INP óptimo (< 50ms)
const DashboardCharts = dynamic(
  () => import("./DashboardCharts").then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="p-10 text-center rounded-3xl text-xs"
        style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", color: "#7A6F5A" }}>
        Cargando gráficos de analítica...
      </div>
    ),
  }
);

interface AdminDashboardProps {
  kpis: DashboardKPIs;
  proximosCheckIns: any[];
  solicitudesPendientes: any[];
  analyticsData?: any;
}

// ── Componente KPI Card ──────────────────────────────────────────
function KpiCard({
  label, value, sub, iconBg, iconColor, icon
}: {
  label: string; value: string | number; sub: string;
  iconBg: string; iconColor: string; icon: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
      style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 4px rgba(42,36,24,0.06)" }}>
      <div className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
        style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate"
          style={{ color: "#7A6F5A" }}>{label}</div>
        <div className="font-serif font-bold text-2xl leading-none" style={{ color: iconColor }}>
          {value}
        </div>
        <div className="text-[11px] mt-1 truncate" style={{ color: "#7A6F5A" }}>{sub}</div>
      </div>
    </div>
  );
}

// ── Componente Card de Sección ───────────────────────────────────
function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl ${className}`}
      style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 6px rgba(42,36,24,0.06)" }}>
      {children}
    </div>
  );
}

export function AdminDashboard({ kpis, proximosCheckIns, solicitudesPendientes, analyticsData }: AdminDashboardProps) {
  const [solicitudes, setSolicitudes] = useState(solicitudesPendientes);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleConfirmar = (reservaId: string) => {
    setLoadingId(reservaId);
    cambiarEstadoReserva(reservaId, "CONFIRMADA").then((result) => {
      if (result.success) {
        startTransition(() => {
          setSolicitudes((prev) => prev.filter((s) => s.id !== reservaId));
        });
      }
      setLoadingId(null);
    });
  };

  return (
    <div className="space-y-7">

      {/* ── PAGE HEADER ──────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: "#7A6F5A" }}>
            <span>Admin</span>
            <span>›</span>
            <span style={{ color: "#2A2418", fontWeight: 600 }}>Dashboard</span>
          </div>
          <h1 className="text-3xl font-serif font-bold" style={{ color: "#2A2418" }}>
            Resumen de Hoy 🏠
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A6F5A" }}>
            Pensión Señora Myriam · {formatDateCL(new Date())}
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <Link href="/admin/reservas?action=nueva"
            className="flex-1 md:flex-none font-semibold text-xs px-5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-sm"
            style={{ background: "#D9583B", color: "#fff" }}>
            ➕ Nueva Reserva
          </Link>
          <Link href="/admin/reservas"
            className="flex-1 md:flex-none font-semibold text-xs px-5 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2"
            style={{ background: "#FFFAF1", color: "#2A2418", borderColor: "#DDD0B3" }}>
            📅 Ver Calendario
          </Link>
          <Link href="/admin/cocina"
            className="flex-1 md:flex-none font-semibold text-xs px-5 py-2.5 rounded-xl border transition-all flex items-center justify-center gap-2"
            style={{ background: "#FFFAF1", color: "#2A2418", borderColor: "#DDD0B3" }}>
            🍽️ Cocina
          </Link>
        </div>
      </div>

      {/* ── KPI CARDS ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="Habitaciones Ocupadas"
          value={`${kpis.habitacionesOcupadasHoy}/${kpis.totalHabitaciones}`}
          sub="Piezas activas hoy"
          icon="🛏️"
          iconBg="rgba(30,173,80,0.12)"
          iconColor="#15803d"
        />
        <KpiCard
          label="Check-ins Hoy"
          value={kpis.checkInsHoyCount}
          sub="Llegadas esperadas"
          icon="🧳"
          iconBg="rgba(59,130,246,0.12)"
          iconColor="#1d4ed8"
        />
        <KpiCard
          label="Check-outs Hoy"
          value={kpis.checkOutsHoyCount}
          sub="Salidas programadas"
          icon="🚪"
          iconBg="rgba(249,115,22,0.12)"
          iconColor="#c2410c"
        />
        <KpiCard
          label="Ocupación Actual"
          value={`${kpis.porcentajeOcupacion}%`}
          sub="Del total disponible"
          icon="📊"
          iconBg="rgba(30,173,80,0.12)"
          iconColor="#15803d"
        />
        <KpiCard
          label="Reservas Pendientes"
          value={kpis.solicitudesPendientesCount}
          sub="Por confirmar"
          icon="⏳"
          iconBg="rgba(217,88,59,0.12)"
          iconColor="#D9583B"
        />
      </div>

      {/* ── COMIDAS DEL DÍA ─────────────────────────────────────── */}
      <SectionCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#D9583B" }}>
                Minuta Diaria
              </div>
              <h2 className="text-xl font-serif font-bold" style={{ color: "#2A2418" }}>
                Comidas a Preparar Hoy
              </h2>
            </div>
            <Link href="/admin/cocina"
              className="text-xs font-semibold hover:underline"
              style={{ color: "#D9583B" }}>
              Ver detalle →
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Desayunos", count: kpis.racionesHoy.desayunos, icon: "🥐", bg: "rgba(217,88,59,0.07)", color: "#92400e", border: "rgba(217,88,59,0.2)", sub: "Pan amasado y té" },
              { label: "Almuerzos", count: kpis.racionesHoy.almuerzos, icon: "🍲", bg: "rgba(249,115,22,0.07)", color: "#9a3412", border: "rgba(249,115,22,0.2)", sub: "Cazuelas caseras" },
              { label: "Cenas", count: kpis.racionesHoy.cenas, icon: "🍽️", bg: "rgba(239,68,68,0.07)", color: "#991b1b", border: "rgba(239,68,68,0.2)", sub: "Guisos o pescado" },
              { label: "Colaciones", count: kpis.racionesHoy.colaciones, icon: "🥪", bg: "rgba(30,173,80,0.07)", color: "#166534", border: "rgba(30,173,80,0.2)", sub: "Para llevar a faena" },
            ].map(item => (
              <div key={item.label} className="rounded-xl p-4 space-y-2"
                style={{ background: item.bg, border: `1px solid ${item.border}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: item.color }}>{item.label}</span>
                  <span className="text-xl">{item.icon}</span>
                </div>
                <div className="font-serif font-bold text-3xl" style={{ color: item.color }}>
                  {item.count}
                </div>
                <p className="text-[11px]" style={{ color: item.color, opacity: 0.7 }}>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── GRID DE LOGÍSTICA OPERATIVA (Check-ins y Pendientes) ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Próximos Check-ins */}
        <SectionCard>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4"
              style={{ borderBottom: "1px solid #DDD0B3" }}>
              <h3 className="font-serif font-bold text-lg" style={{ color: "#2A2418" }}>
                🧳 Próximos Check-ins
              </h3>
              <Link href="/admin/reservas"
                className="text-xs font-semibold hover:underline" style={{ color: "#D9583B" }}>
                Ver todas →
              </Link>
            </div>

            {proximosCheckIns.length === 0 ? (
              <div className="py-8 text-center text-xs rounded-xl"
                style={{ background: "#EDE8DF", color: "#7A6F5A" }}>
                No hay llegadas para hoy ni mañana.
              </div>
            ) : (
              <div className="space-y-2.5">
                {proximosCheckIns.map((r) => {
                  const badge = getEstadoReservaBadge(r.estado);
                  return (
                    <div key={r.id}
                      className="p-3.5 rounded-xl flex items-center justify-between text-xs transition-all"
                      style={{ background: "#F7F3EC", border: "1px solid #DDD0B3" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,88,59,0.4)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#DDD0B3"; }}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                            style={{ background: "rgba(217,88,59,0.1)", color: "#D9583B", border: "1px solid rgba(217,88,59,0.2)" }}>
                            {r.codigoReserva || `RES-${r.id.slice(0, 6)}`}
                          </span>
                          <span className="font-semibold truncate" style={{ color: "#2A2418" }}>{r.cliente?.nombre}</span>
                        </div>
                        <div className="text-[11px] flex items-center gap-2" style={{ color: "#7A6F5A" }}>
                          <span>🛏️ {r.habitacion?.numero}</span>
                          <span>· {formatDateCL(r.fechaCheckIn)}</span>
                        </div>
                        {r.solicitudCambio && (
                          <div className="text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block"
                            style={{ background: "rgba(251,191,36,0.15)", color: "#92400e", border: "1px solid rgba(251,191,36,0.3)" }}>
                            ⚠️ Solicitud de Cambio
                          </div>
                        )}
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SectionCard>

        {/* Solicitudes Pendientes */}
        <SectionCard>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4"
              style={{ borderBottom: "1px solid #DDD0B3" }}>
              <h3 className="font-serif font-bold text-lg" style={{ color: "#2A2418" }}>
                ⏳ Por Confirmar
              </h3>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(217,88,59,0.1)", color: "#D9583B" }}>
                {solicitudes.length} pendientes
              </span>
            </div>

            {solicitudes.length === 0 ? (
              <div className="py-8 text-center text-xs rounded-xl"
                style={{ background: "rgba(30,173,80,0.06)", color: "#15803d", border: "1px solid rgba(30,173,80,0.2)" }}>
                ✓ Todo confirmado. Sin pendientes.
              </div>
            ) : (
              <div className="space-y-2.5">
                {solicitudes.map((r) => (
                  <div key={r.id}
                    className="p-3.5 rounded-xl flex items-center justify-between text-xs transition-all"
                    style={{ background: "#F7F3EC", border: "1px solid #DDD0B3" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(217,88,59,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#DDD0B3"; }}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
                          style={{ background: "rgba(217,88,59,0.1)", color: "#D9583B", border: "1px solid rgba(217,88,59,0.2)" }}>
                          {r.codigoReserva || `RES-${r.id.slice(0, 6)}`}
                        </span>
                        <span className="font-semibold truncate" style={{ color: "#2A2418" }}>{r.cliente?.nombre}</span>
                      </div>
                      <div className="text-[11px]" style={{ color: "#7A6F5A" }}>
                        📞 {r.cliente?.telefono} · 🛏️ {r.habitacion?.numero}
                      </div>
                    </div>
                    <button
                      disabled={loadingId === r.id}
                      onClick={() => handleConfirmar(r.id)}
                      className="font-semibold text-[11px] px-3.5 py-1.5 rounded-lg shadow-xs transition-all flex-shrink-0 ml-3"
                      style={{ background: "#1EAD50", color: "#fff" }}
                    >
                      ✓ Confirmar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* ── GRÁFICOS ESTRATÉGICOS ────────────────────────────────── */}
      <DashboardCharts
        proyeccionOcupacion={analyticsData?.proyeccionOcupacion}
        proyeccionRaciones={analyticsData?.proyeccionRaciones}
        habitacionesMasArrendadasData={analyticsData?.habitacionesMasArrendadasData}
      />
    </div>
  );
}
