"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { HabitacionDTO } from "../types";
import { bloquearHabitacion, actualizarHabitacionAction } from "@/features/reservas/actions/admin-reservas";
import { formatCLP } from "@/shared/utils/formatters";

interface AdminHabitacionesViewProps {
  habitaciones: HabitacionDTO[];
}

export function AdminHabitacionesView({ habitaciones: habitacionesIniciales }: AdminHabitacionesViewProps) {
  const [habitaciones, setHabitaciones] = useState(habitacionesIniciales);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Modal Edición de Habitación
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingHabitacion, setEditingHabitacion] = useState<any | null>(null);

  // Campos Formulario Edición
  const [editNumero, setEditNumero] = useState("");
  const [editCapacidad, setEditCapacidad] = useState(1);
  const [editPrecio, setEditPrecio] = useState(25000);

  const handleCambiarEstado = async (id: string, nuevoEstado: any) => {
    setLoadingId(id);
    const res = await bloquearHabitacion(id, nuevoEstado);
    if (res.success) {
      setHabitaciones(
        habitaciones.map((h) => (h.id === id ? { ...h, estado: nuevoEstado } : h))
      );
    }
    setLoadingId(null);
  };

  const handleAbrirEditar = (h: HabitacionDTO) => {
    setEditingHabitacion(h);
    setEditNumero(h.numero);
    setEditCapacidad(h.capacidad);
    setEditPrecio(Number(h.precioBase));
    setShowEditModal(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHabitacion) return;

    setLoadingId(editingHabitacion.id);

    const res = await actualizarHabitacionAction(editingHabitacion.id, {
      numero: editNumero,
      capacidad: editCapacidad,
      precioBase: editPrecio,
    });

    setLoadingId(null);

    if (res.success) {
      setHabitaciones(
        habitaciones.map((h) =>
          h.id === editingHabitacion.id
            ? { ...h, numero: editNumero, capacidad: editCapacidad, precioBase: editPrecio as any }
            : h
        )
      );
      setShowEditModal(false);
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch (estado) {
      case "OCUPADA":
        return "bg-cactus text-white shadow-xs";
      case "DISPONIBLE":
        return "bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold";
      case "MANTENIMIENTO":
        return "bg-red-600 text-white shadow-xs";
      case "LIMPIEZA":
        return "bg-amber-500 text-white shadow-xs";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Cómputo de Métricas KPI de Hospedaje
  const totalPiezas = habitaciones.length;
  const disponiblesCount = habitaciones.filter((h) => h.estado === "DISPONIBLE").length;
  const ocupadasCount = habitaciones.filter((h) => h.estado === "OCUPADA").length;
  const limpiezaCount = habitaciones.filter((h) => h.estado === "LIMPIEZA" || h.estado === "MANTENIMIENTO").length;
  const totalCamas = habitaciones.reduce((acc, h) => acc + h.capacidad, 0);

  // Fotos de stock locales para dar realismo a cada pieza
  const fotosPiezas = [
    "/images/habitacion.jpg",
    "/images/comedor.jpg",
    "/images/pasillo.jpg",
    "/images/IMAGENES.JPG",
  ];

  return (
    <div className="space-y-7 select-none">
      {/* ── PAGE HEADER ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: "#7A6F5A" }}>
            <span>Admin</span><span>›</span>
            <span style={{ color: "#2A2418", fontWeight: 600 }}>Habitaciones</span>
          </div>
          <h1 className="text-3xl font-serif font-bold" style={{ color: "#2A2418" }}>
            Gestión de Piezas 🛏️
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A6F5A" }}>
            Estado, tarifas y capacidad de camas en tiempo real.
          </p>
        </div>

        <Link
          href="/admin/reservas"
          className="font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2"
          style={{ background: "#D9583B", color: "#fff" }}
        >
          <span>📅 Ver Ocupación en Calendario</span>
        </Link>
      </div>

      {/* 1. TARJETAS KPI DE HOSPEDAJE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Piezas", value: totalPiezas, sub: "Hospedaje Paposo", icon: "🏠", iconBg: "rgba(217,88,59,0.12)", iconColor: "#D9583B" },
          { label: "Disponibles", value: disponiblesCount, sub: "Listas para check-in", icon: "🟢", iconBg: "rgba(34,197,94,0.12)", iconColor: "#15803d" },
          { label: "Ocupadas Hoy", value: ocupadasCount, sub: "Huéspedes alojando", icon: "🔴", iconBg: "rgba(30,173,80,0.12)", iconColor: "#166534" },
          { label: "Limpieza / Bloqueadas", value: limpiezaCount, sub: "Mantenimiento activo", icon: "🧹", iconBg: "rgba(245,158,11,0.12)", iconColor: "#92400e" },
          { label: "Total Camas", value: totalCamas, sub: "Capacidad total", icon: "🛏️", iconBg: "rgba(59,130,246,0.12)", iconColor: "#1d4ed8" },
        ].map(item => (
          <div key={item.label} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
            style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 4px rgba(42,36,24,0.06)" }}>
            <div className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
              style={{ background: item.iconBg, color: item.iconColor }}>
              {item.icon}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate" style={{ color: "#7A6F5A" }}>{item.label}</div>
              <div className="font-serif font-bold text-2xl leading-none" style={{ color: item.iconColor }}>{item.value}</div>
              <div className="text-[11px] mt-1 truncate" style={{ color: "#7A6F5A" }}>{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. GRID DE TARJETAS DE HABITACIONES DE ALTO IMPACTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {habitaciones.map((h, idx) => {
          const badgeClass = getEstadoBadgeClass(h.estado);
          const fotoUrl = fotosPiezas[idx % fotosPiezas.length];

          return (
            <div
              key={h.id}
              className="bg-card border border-sand-border rounded-3xl overflow-hidden shadow-md flex flex-col justify-between hover:border-terracotta/40 hover:shadow-xl transition-all group"
            >
              <div className="space-y-4">
                {/* Imagen Destacada de la Pieza */}
                <div className="relative h-44 w-full bg-sand-deep overflow-hidden">
                  <Image
                    src={fotoUrl}
                    alt={h.numero}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold uppercase shadow-sm ${badgeClass}`}>
                      {h.estado}
                    </span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                    {formatCLP(h.precioBase)} / noche
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-ink text-xl">{h.numero}</h3>
                    <span className="text-xs font-semibold text-muted bg-sand-deep/40 px-2.5 py-1 rounded-full border border-sand-border">
                      🛏️ {h.capacidad} cama(s)
                    </span>
                  </div>

                  {/* Comodidades de la Pieza */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    <span className="bg-sand-deep/40 text-ink px-2 py-0.5 rounded-md font-medium border border-sand-border">
                      🚿 Baño Privado
                    </span>
                    <span className="bg-sand-deep/40 text-ink px-2 py-0.5 rounded-md font-medium border border-sand-border">
                      🌊 Vista al Mar
                    </span>
                    <span className="bg-sand-deep/40 text-ink px-2 py-0.5 rounded-md font-medium border border-sand-border">
                      📶 WiFi Faena
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción Rápida de Estado */}
              <div className="p-5 pt-0 space-y-2 border-t border-sand-border/40 mt-3">
                <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted">
                  <span>Cambiar Estado:</span>
                  <button
                    onClick={() => handleAbrirEditar(h)}
                    className="text-terracotta font-bold hover:underline"
                  >
                    ✏️ Editar Tarifa
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    disabled={loadingId === h.id}
                    onClick={() => handleCambiarEstado(h.id, "DISPONIBLE")}
                    className={`p-2 rounded-xl font-bold transition-all text-center ${
                      h.estado === "DISPONIBLE"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200"
                    }`}
                  >
                    🟢 Libre
                  </button>

                  <button
                    disabled={loadingId === h.id}
                    onClick={() => handleCambiarEstado(h.id, "OCUPADA")}
                    className={`p-2 rounded-xl font-bold transition-all text-center ${
                      h.estado === "OCUPADA"
                        ? "bg-cactus text-white shadow-xs"
                        : "bg-sand-deep/40 hover:bg-sand-deep text-ink border border-sand-border"
                    }`}
                  >
                    🔴 Ocupada
                  </button>

                  <button
                    disabled={loadingId === h.id}
                    onClick={() => handleCambiarEstado(h.id, "LIMPIEZA")}
                    className={`p-2 rounded-xl font-bold transition-all text-center ${
                      h.estado === "LIMPIEZA"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                    }`}
                  >
                    🧹 Limpieza
                  </button>

                  <button
                    disabled={loadingId === h.id}
                    onClick={() => handleCambiarEstado(h.id, "MANTENIMIENTO")}
                    className={`p-2 rounded-xl font-bold transition-all text-center ${
                      h.estado === "MANTENIMIENTO"
                        ? "bg-red-600 text-white shadow-xs"
                        : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    🛠️ Bloquear
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL EDITAR HABITACIÓN (TARIFA Y CAPACIDAD) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-sand-border pb-3">
              <h3 className="font-serif font-bold text-lg text-ink">✏️ Editar Habitación</h3>
              <button onClick={() => setShowEditModal(false)} className="text-muted text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1">Nombre / Número de Pieza *</label>
                <input
                  type="text"
                  required
                  value={editNumero}
                  onChange={(e) => setEditNumero(e.target.value)}
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink font-semibold outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Capacidad de Camas *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={10}
                  value={editCapacidad}
                  onChange={(e) => setEditCapacidad(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Precio Base por Noche ($ CLP) *</label>
                <input
                  type="number"
                  required
                  step={1000}
                  value={editPrecio}
                  onChange={(e) => setEditPrecio(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink font-mono font-bold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loadingId === editingHabitacion?.id}
                className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold py-3.5 rounded-full shadow-md text-xs mt-2"
              >
                {loadingId === editingHabitacion?.id ? "Guardando..." : "✨ Guardar Cambios en Pieza"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
