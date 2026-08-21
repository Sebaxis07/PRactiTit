"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cambiarEstadoReserva, confirmarPagoReserva } from "../actions/admin-reservas";
import { crearSolicitudReserva, solicitarCambioHuesped } from "../actions/reservas";
import { formatDateCL, formatCLP, getEstadoReservaBadge } from "@/shared/utils/formatters";
import { HabitacionDTO } from "@/features/habitaciones/types";

interface AdminReservasViewProps {
  reservas: any[];
  habitaciones: HabitacionDTO[];
  initialAction?: string;
}

export function AdminReservasView({ reservas: reservasIniciales, habitaciones }: AdminReservasViewProps) {
  const [reservas, setReservas] = useState(reservasIniciales);
  const [vistaModo, setVistaModo] = useState<"LISTA" | "CALENDARIO">("CALENDARIO");
  const [busqueda, setBusqueda] = useState<string>("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroTipoCliente, setFiltroTipoCliente] = useState<string>("TODOS");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Habitación Seleccionada para Vista de Calendario
  const [selectedHabitacionId, setSelectedHabitacionId] = useState<string>(habitaciones[0]?.id || "");
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Modales
  const [showNuevaReservaModal, setShowNuevaReservaModal] = useState<boolean>(false);
  const [selectedReservaDetalle, setSelectedReservaDetalle] = useState<any | null>(null);

  // Formulario Nueva Reserva Manual
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [tipoCliente, setTipoCliente] = useState<"TURISTA" | "TRABAJADOR_FAENA">("TURISTA");
  const [empresa, setEmpresa] = useState("");
  const [habitacionIdForm, setHabitacionIdForm] = useState(habitaciones[0]?.id || "");
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [desayunos, setDesayunos] = useState(1);
  const [colaciones, setColaciones] = useState(1);
  const [cenas, setCenas] = useState(1);

  // Lógica de Calendario por Habitación
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonthDate);
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const getDateFromDay = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const todayZero = new Date();
  todayZero.setHours(0, 0, 0, 0);

  // Obtener Reserva asociada a un día para la habitación seleccionada
  const getReservaDelDia = (day: number) => {
    const d = getDateFromDay(day);
    return reservas.find((r) => {
      if (r.habitacionId !== selectedHabitacionId) return false;
      if (r.estado === "CANCELADA") return false;
      const inD = new Date(r.fechaCheckIn);
      inD.setHours(0, 0, 0, 0);
      const outD = new Date(r.fechaCheckOut);
      outD.setHours(0, 0, 0, 0);
      return d >= inD && d < outD;
    });
  };

  const handleCambiarEstado = async (reservaId: string, nuevoEstado: any) => {
    setLoadingId(reservaId);
    const res = await cambiarEstadoReserva(reservaId, nuevoEstado);
    if (res.success) {
      setReservas(reservas.map((r) => (r.id === reservaId ? { ...r, estado: nuevoEstado } : r)));
      if (selectedReservaDetalle?.id === reservaId) {
        setSelectedReservaDetalle({ ...selectedReservaDetalle, estado: nuevoEstado });
      }
    }
    setLoadingId(null);
  };

  const handleConfirmarPago = async (reservaId: string, nuevoEstadoPago: "PAGADO" | "PENDIENTE", metodo: string) => {
    setLoadingId(reservaId);
    const res = await confirmarPagoReserva(reservaId, nuevoEstadoPago, metodo);
    if (res.success) {
      setReservas(reservas.map((r) => (r.id === reservaId ? { ...r, estadoPago: nuevoEstadoPago, metodoPago: metodo } : r)));
      if (selectedReservaDetalle?.id === reservaId) {
        setSelectedReservaDetalle({ ...selectedReservaDetalle, estadoPago: nuevoEstadoPago, metodoPago: metodo });
      }
    }
    setLoadingId(null);
  };

  const handleLimpiarSolicitudCambio = async (reservaId: string, codigo: string) => {
    setLoadingId(reservaId);
    const res = await solicitarCambioHuesped(codigo, "");
    if (res.success) {
      setReservas(reservas.map((r) => (r.id === reservaId ? { ...r, solicitudCambio: null } : r)));
      if (selectedReservaDetalle?.id === reservaId) {
        setSelectedReservaDetalle({ ...selectedReservaDetalle, solicitudCambio: null });
      }
    }
    setLoadingId(null);
  };

  const handleCrearReservaManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !telefono || !habitacionIdForm) return;

    setLoadingId("nueva");

    const payload = {
      nombre,
      telefono,
      tipo: tipoCliente,
      empresa,
      habitacionId: habitacionIdForm,
      fechaCheckIn: checkIn,
      fechaCheckOut: checkOut,
      servicios: [
        {
          fechaServicio: checkIn,
          desayunosCant: desayunos,
          colacionesCant: colaciones,
          cenasCant: cenas,
        },
      ],
    };

    const res = await crearSolicitudReserva(payload);
    if (res.success) {
      setShowNuevaReservaModal(false);
      window.location.reload();
    }
    setLoadingId(null);
  };

  // Generar Comprobante PDF desde el Admin
  const handleGenerarPDFAdmin = (r: any) => {
    const doc = new jsPDF();
    const codigoRes = r.codigoReserva || `RES-${r.id.slice(0, 8)}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(217, 88, 59);
    doc.text("PENSIÓN SEÑORA MYRIAM", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Alojamiento y Comida Casera en Paposo · Región de Antofagasta, Chile", 105, 26, { align: "center" });
    doc.text("Contacto: +56 9 4019 9049 · pensionmyriam.cl", 105, 31, { align: "center" });

    doc.setDrawColor(217, 88, 59);
    doc.setLineWidth(0.8);
    doc.line(14, 36, 196, 36);

    doc.setFillColor(255, 250, 241);
    doc.setDrawColor(217, 88, 59);
    doc.roundedRect(14, 42, 182, 24, 3, 3, "FD");

    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text("COMPROBANTE DE RESERVA DE HOSPEDAJE", 20, 51);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 88, 59);
    doc.text(`CÓDIGO DE RESERVA: ${codigoRes}`, 20, 60);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("DATOS DEL HUÉSPED / EMPRESA", 14, 76);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre Completo: ${r.cliente?.nombre}`, 14, 83);
    doc.text(`Teléfono: ${r.cliente?.telefono}`, 14, 89);
    if (r.cliente?.rutPasaporte) doc.text(`RUT / Pasaporte: ${r.cliente.rutPasaporte}`, 14, 95);
    doc.text(`Tipo de Cliente: ${r.cliente?.tipo === "TRABAJADOR_FAENA" ? "Trabajador de Faena" : "Turista"}`, 14, r.cliente?.rutPasaporte ? 101 : 95);
    if (r.cliente?.empresa) doc.text(`Empresa: ${r.cliente.empresa}`, 14, r.cliente?.rutPasaporte ? 107 : 101);

    const inDate = new Date(r.fechaCheckIn);
    const outDate = new Date(r.fechaCheckOut);
    const noches = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24)));
    const precioBase = Number(r.habitacion?.precioBase || 25000);
    const subtotalHospedaje = precioBase * noches;

    autoTable(doc, {
      startY: r.cliente?.empresa ? 115 : 103,
      head: [["Detalle de la Reserva", "Información Registrada"]],
      body: [
        ["Estado Actual", r.estado],
        ["Habitación Asignada", `${r.habitacion?.numero} (${r.habitacion?.capacidad} cama(s))`],
        ["Fecha Check-in", formatDateCL(r.fechaCheckIn)],
        ["Fecha Check-out", formatDateCL(r.fechaCheckOut)],
        ["Duración de Estadía", `${noches} noche(s)`],
        ["Tarifa por Noche", formatCLP(precioBase)],
        ["Subtotal Hospedaje", formatCLP(subtotalHospedaje)],
        ["Portal del Huésped", "pensionmyriam.cl/mi-reserva"],
      ],
      theme: "grid",
      headStyles: { fillColor: [217, 88, 59], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9.5, cellPadding: 3.5 },
    });

    doc.save(`Comprobante_Admin_${codigoRes}.pdf`);
  };

  // Filtrado múltiple para la vista de Lista
  const reservasFiltradas = reservas.filter((r) => {
    const busquedaClean = busqueda.toLowerCase().trim();
    const coincideNombre = r.cliente?.nombre?.toLowerCase().includes(busquedaClean);
    const coincideCodigo = r.codigoReserva?.toLowerCase().includes(busquedaClean) || r.id?.toLowerCase().includes(busquedaClean);
    const coincideEstado = filtroEstado === "TODOS" || r.estado === filtroEstado;
    const coincideTipo = filtroTipoCliente === "TODOS" || r.cliente?.tipo === filtroTipoCliente;
    return (coincideNombre || coincideCodigo) && coincideEstado && coincideTipo;
  });

  const habitacionSeleccionadaObj = habitaciones.find((h) => h.id === selectedHabitacionId) || habitaciones[0];

  // Cálculos dinámicos para el Modal de Detalle de Reserva
  let modalNoches = 1;
  let modalPrecioNoche = 25000;
  let modalTotalHospedaje = 25000;
  let modalDesayunos = 0;
  let modalColaciones = 0;
  let modalCenas = 0;
  let modalTotalAlimentacion = 0;
  let modalTotalGeneral = 25000;
  let modalRestricciones = "";

  if (selectedReservaDetalle) {
    const inD = new Date(selectedReservaDetalle.fechaCheckIn);
    const outD = new Date(selectedReservaDetalle.fechaCheckOut);
    const diff = Math.abs(outD.getTime() - inD.getTime());
    modalNoches = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    modalPrecioNoche = Number(selectedReservaDetalle.habitacion?.precioBase || 25000);
    modalTotalHospedaje = modalPrecioNoche * modalNoches;

    if (selectedReservaDetalle.servicios && selectedReservaDetalle.servicios.length > 0) {
      const s = selectedReservaDetalle.servicios[0];
      modalDesayunos = s.desayunosCant || 0;
      modalColaciones = s.colacionesCant || 0;
      modalCenas = s.cenasCant || 0;
      modalRestricciones = s.restriccionDietaria || "";
      modalTotalAlimentacion = (modalDesayunos * 4000 + modalColaciones * 6000 + modalCenas * 8000) * modalNoches;
    }
    modalTotalGeneral = modalTotalHospedaje + modalTotalAlimentacion;
  }

  return (
    <div className="space-y-6">
      {/* ── PAGE HEADER ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: "#7A6F5A" }}>
            <span>Admin</span><span>›</span>
            <span style={{ color: "#2A2418", fontWeight: 600 }}>Reservas</span>
          </div>
          <h1 className="text-3xl font-serif font-bold" style={{ color: "#2A2418" }}>
            Gestión de Reservas 📅
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A6F5A" }}>
            Calendario de ocupación por habitación, check-ins y lista de reservas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Conmutador de Vista */}
          <div className="p-1 rounded-xl flex items-center text-xs font-semibold"
            style={{ background: "#FFFAF1", border: "1px solid #DDD0B3" }}>
            <button
              onClick={() => setVistaModo("CALENDARIO")}
              className="px-4 py-2 rounded-lg transition-all"
              style={vistaModo === "CALENDARIO"
                ? { background: "#D9583B", color: "#fff", fontWeight: 700 }
                : { color: "#7A6F5A" }}
            >
              📅 Calendario
            </button>
            <button
              onClick={() => setVistaModo("LISTA")}
              className="px-4 py-2 rounded-lg transition-all"
              style={vistaModo === "LISTA"
                ? { background: "#D9583B", color: "#fff", fontWeight: 700 }
                : { color: "#7A6F5A" }}
            >
              📋 Lista
            </button>
          </div>

          <button
            onClick={() => setShowNuevaReservaModal(true)}
            className="font-semibold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 flex items-center gap-2"
            style={{ background: "#D9583B", color: "#fff" }}
          >
            ➕ Nueva Reserva
          </button>
        </div>
      </div>

      {/* VISTA 1: CALENDARIO INTERACTIVO POR HABITACIÓN */}
      {vistaModo === "CALENDARIO" && (
        <div className="space-y-6">
          {/* Selector de Habitación (Pestañas de Piezas) */}
          <div className="rounded-2xl p-6 space-y-4"
            style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 6px rgba(42,36,24,0.06)" }}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "#D9583B" }}>
                  Filtrar Ocupación
                </span>
                <h2 className="text-xl font-serif font-bold" style={{ color: "#2A2418" }}>
                  Selecciona la Habitación
                </h2>
              </div>

              {/* Control de Mes */}
              <div className="flex items-center gap-3 bg-sand-deep/40 px-4 py-2 rounded-full border border-sand-border">
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                  className="w-8 h-8 rounded-full border border-sand-border bg-white hover:bg-terracotta hover:text-white grid place-items-center text-xs font-bold transition-colors"
                >
                  ❮
                </button>
                <span className="font-serif font-bold text-sm text-ink min-w-[110px] text-center">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                  className="w-8 h-8 rounded-full border border-sand-border bg-white hover:bg-terracotta hover:text-white grid place-items-center text-xs font-bold transition-colors"
                >
                  ❯
                </button>
              </div>
            </div>

            {/* Pestañas de Habitaciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {habitaciones.map((h) => {
                const isSelected = h.id === selectedHabitacionId;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHabitacionId(h.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1 ${
                      isSelected
                        ? "border-terracotta bg-card shadow-md ring-2 ring-terracotta/20"
                        : "border-sand-border bg-white hover:border-terracotta/40"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-serif font-bold text-ink text-base">{h.numero}</span>
                      <span className="text-[10px] font-semibold uppercase bg-cactus/15 text-cactus px-2 py-0.5 rounded-full">
                        {h.estado}
                      </span>
                    </div>
                    <div className="text-xs text-muted">
                      Capacidad: {h.capacidad} cama(s) · {formatCLP(h.precioBase)}/noche
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid del Calendario Mensual de la Habitación Seleccionada */}
          <div className="rounded-2xl p-6 sm:p-8 space-y-6"
            style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 6px rgba(42,36,24,0.06)" }}>
            <div className="flex justify-between items-center border-b border-sand-border/60 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-terracotta font-semibold">
                  Mapa de Ocupación
                </span>
                <h3 className="text-2xl font-serif font-bold text-ink">
                  {habitacionSeleccionadaObj?.numero}
                </h3>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5 text-cactus">
                  <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300"></span>
                  <span>🟢 Disponible</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-700">
                  <span className="w-3.5 h-3.5 rounded-md bg-red-100 border border-red-300"></span>
                  <span>🔴 Ocupado / Reservado</span>
                </div>
              </div>
            </div>

            {/* Contenedor Responsivo para evitar encogimiento en Móviles */}
            <div className="overflow-x-auto scrollbar-thin">
              <div className="min-w-[760px] lg:min-w-0 space-y-4">
                {/* Grid 7 Días */}
                <div className="grid grid-cols-7 text-center text-xs font-bold uppercase text-terracotta tracking-wider">
                  <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {/* Vacíos */}
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-20 sm:h-24" />
                  ))}

                  {/* Días del Mes con Reservas */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const d = getDateFromDay(dayNum);
                    const isPast = d.getTime() < todayZero.getTime();
                    const reservaDia = getReservaDelDia(dayNum);

                    return (
                      <div
                        key={dayNum}
                        onClick={() => {
                          if (reservaDia) {
                            setSelectedReservaDetalle(reservaDia);
                          } else if (!isPast) {
                            setHabitacionIdForm(selectedHabitacionId);
                            const dateStr = d.toISOString().split("T")[0];
                            setCheckIn(dateStr);
                            const nextStr = new Date(d.getTime() + 86400000).toISOString().split("T")[0];
                            setCheckOut(nextStr);
                            setShowNuevaReservaModal(true);
                          }
                        }}
                        className={`h-20 sm:h-24 rounded-2xl p-2 font-bold text-xs transition-all flex flex-col justify-between border-2 cursor-pointer ${
                          reservaDia
                            ? "bg-red-50 border-red-300 text-red-900 shadow-sm hover:border-red-500"
                            : isPast
                            ? "bg-stone-100 border-stone-200 text-stone-400 opacity-60 line-through font-normal cursor-not-allowed"
                            : "bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100/50"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-serif text-sm">{dayNum}</span>
                          {reservaDia && (
                            <span className="font-mono text-[9px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded">
                              {reservaDia.codigoReserva || `RES-${reservaDia.id.slice(0, 4)}`}
                            </span>
                          )}
                        </div>

                        {reservaDia ? (
                          <div className="space-y-0.5">
                            <div className="font-bold truncate text-[11px]">{reservaDia.cliente?.nombre}</div>
                            <span className="text-[9px] bg-red-200/80 px-1.5 py-0.5 rounded font-semibold inline-block">
                              {reservaDia.estado}
                            </span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-emerald-700/80 font-medium">
                            {isPast ? "Pasado" : "+ Disponible"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: LISTA DE RESERVAS TANSTACK STYLE */}
      {vistaModo === "LISTA" && (
        <div className="space-y-6">
          {/* Barra de Filtros y Búsqueda */}
          <div className="rounded-2xl p-4 space-y-3"
            style={{ background: "#FFFAF1", border: "1px solid #DDD0B3" }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Búsqueda por nombre o código */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  🔍 Buscar por Código o Huésped
                </label>
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej. RES-2026-755205 o Carlos..."
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none focus:ring-2 focus:ring-terracotta"
                />
              </div>

              {/* Filtro por Estado */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  📌 Estado
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="TODOS">Todos los Estados</option>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="CONFIRMADA">CONFIRMADA</option>
                  <option value="FINALIZADA">FINALIZADA</option>
                  <option value="CANCELADA">CANCELADA</option>
                </select>
              </div>

              {/* Filtro por Tipo de Cliente */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  👤 Tipo de Huésped
                </label>
                <select
                  value={filtroTipoCliente}
                  onChange={(e) => setFiltroTipoCliente(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none focus:ring-2 focus:ring-terracotta"
                >
                  <option value="TODOS">Todos los Tipos</option>
                  <option value="TURISTA">Turista / Particular</option>
                  <option value="TRABAJADOR_FAENA">Trabajador de Faena</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 overflow-hidden"
            style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 6px rgba(42,36,24,0.06)" }}>
            {reservasFiltradas.length === 0 ? (
              <div className="p-8 text-center bg-sand-deep/20 border border-dashed border-sand-border rounded-2xl text-muted text-xs">
                No se encontraron reservas con los filtros aplicados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="uppercase text-[11px] tracking-wider"
                  style={{ background: "#EDE8DF", borderBottom: "1px solid #DDD0B3", color: "#7A6F5A" }}>
                    <tr>
                      <th className="p-3">Código & Huésped</th>
                      <th className="p-3">Habitación</th>
                      <th className="p-3">Check-in / Check-out</th>
                      <th className="p-3 text-center">Noches</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-border/60">
                    {reservasFiltradas.map((r) => {
                      const badge = getEstadoReservaBadge(r.estado);
                      const inDate = new Date(r.fechaCheckIn);
                      const outDate = new Date(r.fechaCheckOut);
                      const noches = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24)));
                      const tieneSolicitudCambio = !!r.solicitudCambio;

                      return (
                        <tr key={r.id} className="transition-colors"
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(237,232,223,0.5)"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                          <td className="p-3 font-semibold text-ink">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold bg-terracotta/10 text-terracotta px-2.5 py-0.5 rounded-md border border-terracotta/20">
                                {r.codigoReserva || `RES-${r.id.slice(0, 6)}`}
                              </span>
                              <span>{r.cliente?.nombre}</span>
                            </div>

                            <div className="text-[11px] text-muted font-normal mt-1 flex flex-wrap items-center gap-2">
                              <span>📞 {r.cliente?.telefono}</span>
                              <span>· {r.cliente?.tipo === "TRABAJADOR_FAENA" ? `👷 ${r.cliente?.empresa || "Faena"}` : "🌴 Turista"}</span>
                            </div>

                            {tieneSolicitudCambio && (
                              <div className="mt-1.5 inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                <span>⚠️ Solicitud de Cambio del Huésped</span>
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-ink font-medium">
                            <div>{r.habitacion?.numero}</div>
                            <div className="text-[11px] text-muted font-normal">
                              {formatCLP(r.habitacion?.precioBase)} / noche
                            </div>
                          </td>

                          <td className="p-3 text-xs">
                            <div className="font-semibold text-ink">{formatDateCL(r.fechaCheckIn)}</div>
                            <div className="text-cactus font-semibold">{formatDateCL(r.fechaCheckOut)}</div>
                          </td>

                          <td className="p-3 text-center font-bold text-ink">
                            {noches} n
                          </td>

                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.className}`}>
                              {badge.label}
                            </span>
                          </td>

                          <td className="p-3 text-right space-x-1.5">
                            <button
                              onClick={() => setSelectedReservaDetalle(r)}
                              className="bg-sand-deep hover:bg-sand-border text-ink font-semibold text-[11px] px-3 py-1.5 rounded-xl border border-sand-border"
                            >
                              👁️ Ver Detalle
                            </button>

                            {r.estado === "PENDIENTE" && (
                              <button
                                disabled={loadingId === r.id}
                                onClick={() => handleCambiarEstado(r.id, "CONFIRMADA")}
                                className="bg-cactus hover:bg-emerald-700 text-white font-semibold text-[11px] px-3 py-1.5 rounded-xl shadow-xs"
                              >
                                ✓ Confirmar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DETALLE DE RESERVA CON SOLICITUD DE CAMBIO Y PDF */}
      {selectedReservaDetalle && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto scrollbar-thin">
            {/* Cabecera del Modal */}
            <div className="flex justify-between items-start border-b border-sand-border/50 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-terracotta bg-terracotta/10 px-3.5 py-1 rounded-full border border-terracotta/25">
                    {selectedReservaDetalle.codigoReserva || `RES-${selectedReservaDetalle.id.slice(0, 8)}`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getEstadoReservaBadge(selectedReservaDetalle.estado).className}`}>
                    {getEstadoReservaBadge(selectedReservaDetalle.estado).label}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-xl text-ink mt-2">
                  Reserva de {selectedReservaDetalle.cliente?.nombre}
                </h3>
              </div>

              <button 
                onClick={() => setSelectedReservaDetalle(null)} 
                className="text-ink hover:text-terracotta text-2xl font-bold bg-sand-deep/45 w-9 h-9 rounded-full grid place-items-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Alerta de Solicitud de Cambio Enviada por el Huésped */}
            {selectedReservaDetalle.solicitudCambio && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2.5 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="flex items-center gap-1">⚠️ SOLICITUD DE CAMBIO RECIBIDA</span>
                  <button
                    onClick={() => handleLimpiarSolicitudCambio(selectedReservaDetalle.id, selectedReservaDetalle.codigoReserva)}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1 rounded-lg text-[9px] transition-all"
                  >
                    ✓ Marcar Atendida
                  </button>
                </div>
                <p className="italic bg-white p-3 rounded-xl border border-amber-200 text-ink">
                  "{selectedReservaDetalle.solicitudCambio}"
                </p>
              </div>
            )}

            {/* Ficha 1: Fechas de Estadía */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted block">Calendario de Alojamiento</span>
              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                <div className="bg-white p-3 rounded-2xl border border-sand-border flex flex-col justify-center">
                  <span className="text-[9px] text-muted font-bold uppercase tracking-wider mb-0.5">📅 Check-in</span>
                  <span className="font-serif font-bold text-ink text-[11px] sm:text-xs">
                    {formatDateCL(selectedReservaDetalle.fechaCheckIn)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-sand-border flex flex-col justify-center">
                  <span className="text-[9px] text-muted font-bold uppercase tracking-wider mb-0.5">🚪 Check-out</span>
                  <span className="font-serif font-bold text-cactus text-[11px] sm:text-xs">
                    {formatDateCL(selectedReservaDetalle.fechaCheckOut)}
                  </span>
                </div>

                <div className="bg-sand-deep/40 p-3 rounded-2xl border border-sand-border flex flex-col justify-center">
                  <span className="text-[9px] text-muted font-bold uppercase tracking-wider mb-0.5">⏳ Duración</span>
                  <span className="font-serif font-bold text-terracotta text-xs">
                    {modalNoches} Noche(s)
                  </span>
                </div>
              </div>
            </div>

            {/* Ficha 2: Detalles del Cliente e Inmueble */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-sand-deep/20 p-4 rounded-2xl border border-sand-border/80">
              <div>
                <span className="text-muted font-bold block mb-0.5">Contacto WhatsApp:</span>
                <a 
                  href={`https://wa.me/${selectedReservaDetalle.cliente?.telefono?.replace(/[^0-9]/g, "")}`}
                  target="_blank" 
                  rel="noreferrer" 
                  className="font-bold text-terracotta hover:underline block"
                >
                  📞 {selectedReservaDetalle.cliente?.telefono}
                </a>
              </div>
              <div>
                <span className="text-muted font-bold block mb-0.5">Tipo de Huésped / Empresa:</span>
                <div className="font-bold text-ink">
                  {selectedReservaDetalle.cliente?.tipo === "TRABAJADOR_FAENA" 
                    ? `👷 Faenero (${selectedReservaDetalle.cliente?.empresa || "Particular"})` 
                    : "🌴 Turista"}
                </div>
              </div>
              <div className="pt-2 border-t border-sand-border/40">
                <span className="text-muted font-bold block mb-0.5">Pieza Asignada:</span>
                <div className="font-bold text-ink">🏠 {selectedReservaDetalle.habitacion?.numero}</div>
              </div>
              <div className="pt-2 border-t border-sand-border/40">
                <span className="text-muted font-bold block mb-0.5">Tarifa Base por Noche:</span>
                <div className="font-bold text-ink">{formatCLP(modalPrecioNoche)}</div>
              </div>
            </div>

            {/* Ficha 3: Servicios de Comida Casera */}
            {selectedReservaDetalle.servicios && selectedReservaDetalle.servicios.length > 0 && (
              <div className="space-y-3 p-4 rounded-2xl bg-white border border-sand-border/70 text-xs">
                <div className="flex justify-between items-center border-b border-sand-border/30 pb-2">
                  <span className="font-bold text-ink">🍽️ Servicios de Alimentación (Ración Diaria)</span>
                  <span className="text-[10px] text-muted">Total: {modalDesayunos + modalColaciones + modalCenas} raciones</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-900 border border-amber-100">
                    <span className="font-bold block">🥐 Desayuno</span>
                    <span className="text-sm font-black">{modalDesayunos}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-100">
                    <span className="font-bold block">🥪 Vianda</span>
                    <span className="text-sm font-black">{modalColaciones}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-red-50 text-red-900 border border-red-100">
                    <span className="font-bold block">🍲 Cena</span>
                    <span className="text-sm font-black">{modalCenas}</span>
                  </div>
                </div>

                {modalRestricciones && (
                  <div className="p-2.5 rounded-xl bg-amber-100/50 text-amber-900 border border-amber-200 text-[11px] font-medium">
                    ⚠️ Restricción Dietaria: <strong>{modalRestricciones}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Ficha 4: Desglose Financiero e Información de Pago */}
            <div className="p-4 rounded-2xl bg-[#FFFAF1] border border-sand-border text-xs space-y-2">
              <div className="flex justify-between items-center text-muted">
                <span>Subtotal Hospedaje ({modalNoches} noches):</span>
                <span className="font-bold text-ink">{formatCLP(modalTotalHospedaje)}</span>
              </div>
              {modalTotalAlimentacion > 0 && (
                <div className="flex justify-between items-center text-muted">
                  <span>Subtotal Alimentación:</span>
                  <span className="font-bold text-ink">{formatCLP(modalTotalAlimentacion)}</span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-sand-border/40 pt-2 text-muted">
                <span>Método de Pago:</span>
                <span className="font-semibold text-ink">
                  {selectedReservaDetalle.metodoPago === "DEBITO" && "💳 Débito (Webpay)"}
                  {selectedReservaDetalle.metodoPago === "CREDITO" && "💳 Crédito (Webpay)"}
                  {selectedReservaDetalle.metodoPago === "TRANSFERENCIA" && "🏦 Transferencia Bancaria"}
                  {!selectedReservaDetalle.metodoPago && "No Registrado"}
                </span>
              </div>
              <div className="flex justify-between items-center text-muted">
                <span>Estado del Pago:</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedReservaDetalle.estadoPago === "PAGADO"
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-amber-100 text-amber-950 border border-amber-300 animate-pulse"
                }`}>
                  {selectedReservaDetalle.estadoPago === "PAGADO" ? "✓ PAGADO" : "⏳ PENDIENTE"}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-sand-border/50 pt-2 font-bold text-ink text-sm sm:text-base">
                <span>Total de Cobro:</span>
                <span className="font-serif font-black text-terracotta">{formatCLP(selectedReservaDetalle.montoPagado || modalTotalGeneral)}</span>
              </div>
            </div>

            {/* Acciones de Control del Administrador */}
            <div className="space-y-3 pt-2 border-t border-sand-border/50">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted block mb-1">Acciones Administrativas</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={loadingId === selectedReservaDetalle.id}
                  onClick={() => handleCambiarEstado(selectedReservaDetalle.id, "CONFIRMADA")}
                  className={`py-3 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                    selectedReservaDetalle.estado === "CONFIRMADA"
                      ? "bg-cactus text-white cursor-default"
                      : "bg-[#1EAD50] hover:bg-emerald-700 text-white"
                  }`}
                >
                  {selectedReservaDetalle.estado === "CONFIRMADA" ? "✓ Confirmada" : "Confirmar"}
                </button>

                <button
                  type="button"
                  disabled={loadingId === selectedReservaDetalle.id}
                  onClick={() => handleCambiarEstado(selectedReservaDetalle.id, "FINALIZADA")}
                  className={`py-3 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                    selectedReservaDetalle.estado === "FINALIZADA"
                      ? "bg-ink text-white cursor-default"
                      : "bg-[#2A2418] hover:bg-black text-white"
                  }`}
                >
                  {selectedReservaDetalle.estado === "FINALIZADA" ? "🏁 Finalizada" : "Finalizar"}
                </button>

                <button
                  type="button"
                  disabled={loadingId === selectedReservaDetalle.id}
                  onClick={() => handleCambiarEstado(selectedReservaDetalle.id, "CANCELADA")}
                  className={`py-3 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95 ${
                    selectedReservaDetalle.estado === "CANCELADA"
                      ? "bg-red-800 text-white cursor-default"
                      : "bg-[#EF4444] hover:bg-red-700 text-white"
                  }`}
                >
                  {selectedReservaDetalle.estado === "CANCELADA" ? "✕ Cancelada" : "Cancelar"}
                </button>
              </div>

              {/* Acciones de Pago del Administrador */}
              {selectedReservaDetalle.estadoPago === "PENDIENTE" ? (
                <button
                  type="button"
                  disabled={loadingId === selectedReservaDetalle.id}
                  onClick={() => handleConfirmarPago(selectedReservaDetalle.id, "PAGADO", selectedReservaDetalle.metodoPago || "TRANSFERENCIA")}
                  className="w-full bg-[#1EAD50] hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  🏦 Confirmar Recepción de Transferencia
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loadingId === selectedReservaDetalle.id}
                  onClick={() => handleConfirmarPago(selectedReservaDetalle.id, "PENDIENTE", selectedReservaDetalle.metodoPago || "TRANSFERENCIA")}
                  className="w-full bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  ⏳ Revertir Pago a Pendiente
                </button>
              )}

              <button
                type="button"
                onClick={() => handleGenerarPDFAdmin(selectedReservaDetalle)}
                className="w-full bg-white hover:bg-sand-deep/40 text-ink border border-sand-border font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>📄 Descargar Comprobante PDF Oficial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA RESERVA MANUAL */}
      {showNuevaReservaModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-sand-border pb-3">
              <h3 className="font-serif font-bold text-lg text-ink">➕ Crear Reserva Manual</h3>
              <button onClick={() => setShowNuevaReservaModal(false)} className="text-muted text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearReservaManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1">Nombre Huésped *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Manuel Contreras"
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Teléfono WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+56 9 9876 5432"
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Habitación *</label>
                <select
                  value={habitacionIdForm}
                  onChange={(e) => setHabitacionIdForm(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink outline-none"
                >
                  {habitaciones.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.numero} ({formatCLP(h.precioBase)}/noche)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-muted mb-1">Check-in</label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-muted mb-1">Check-out</label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-ink outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingId === "nueva"}
                className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold py-3 rounded-full shadow-md text-xs mt-2"
              >
                {loadingId === "nueva" ? "Creando..." : "✨ Guardar y Asignar Código Único"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
