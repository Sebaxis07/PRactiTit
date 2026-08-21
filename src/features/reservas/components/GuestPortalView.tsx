"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { consultarReservaPorCodigo, solicitarCambioHuesped, calificarReserva } from "../actions/reservas";
import {
  guardarPreferenciaPlatoAction,
  renunciarServicioAction,
} from "@/features/servicios-comida/actions/cocina";
import { formatDateCL, formatCLP, getEstadoReservaBadge } from "@/shared/utils/formatters";

interface GuestPortalViewProps {
  menuDiaGeneral?: any;
}

export function GuestPortalView({ menuDiaGeneral }: GuestPortalViewProps) {
  const [codigoInput, setCodigoInput] = useState<string>("");
  const [contactoInput, setContactoInput] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [reserva, setReserva] = useState<any | null>(null);

  // Modales
  const [showSolicitudModal, setShowSolicitudModal] = useState<boolean>(false);
  const [showMenuModal, setShowMenuModal] = useState<boolean>(false);
  const [showCalificacionModal, setShowCalificacionModal] = useState<boolean>(false);

  // Solicitud de Cambio
  const [tipoSolicitud, setTipoSolicitud] = useState<string>("FECHAS");
  const [detalleSolicitud, setDetalleSolicitud] = useState<string>("");
  const [solicitudEnviada, setSolicitudEnviada] = useState<boolean>(false);

  // Preferencias y renuncias de comida
  const [preferenciaAlmuerzo, setPreferenciaAlmuerzo] = useState<string>("");
  const [preferenciaCena, setPreferenciaCena] = useState<string>("");
  const [renunciaDesayuno, setRenunciaDesayuno] = useState<boolean>(false);
  const [renunciaAlmuerzo, setRenunciaAlmuerzo] = useState<boolean>(false);
  const [renunciaCena, setRenunciaCena] = useState<boolean>(false);
  const [guardadoPreferenciaExito, setGuardadoPreferenciaExito] = useState<boolean>(false);

  // Calificaciones
  const [estrellasSeleccionadas, setEstrellasSeleccionadas] = useState<number>(5);
  const [comentarioOpinion, setComentarioOpinion] = useState<string>("");
  const [autorNombre, setAutorNombre] = useState<string>("");
  const [calificarLoading, setCalificarLoading] = useState<boolean>(false);
  const [calificacionError, setCalificacionError] = useState<string | null>(null);
  const [calificacionGuardadaExito, setCalificacionGuardadaExito] = useState<boolean>(false);

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await consultarReservaPorCodigo(codigoInput, contactoInput);
    setIsLoading(false);

    if (result.success) {
      setReserva(result.reserva);
      if (result.reserva?.cliente?.nombre) {
        setAutorNombre(result.reserva.cliente.nombre);
      }
      if (result.reserva?.servicios && result.reserva.servicios.length > 0) {
        const s = result.reserva.servicios[0];
        setPreferenciaAlmuerzo(s.preferenciaAlmuerzo || "");
        setPreferenciaCena(s.preferenciaCena || "");
        setRenunciaDesayuno(!!s.renunciaDesayuno);
        setRenunciaAlmuerzo(!!s.renunciaAlmuerzo);
        setRenunciaCena(!!s.renunciaCena);
      }
    } else {
      setErrorMessage(result.error || "No se encontró ninguna reserva con el código ingresado.");
    }
  };

  const handleEnviarCalificacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserva) return;

    setCalificarLoading(true);
    setCalificacionError(null);

    const res = await calificarReserva({
      reservaId: reserva.id,
      estrellas: estrellasSeleccionadas,
      comentario: comentarioOpinion,
      nombreAutor: autorNombre.trim() || reserva.cliente?.nombre || "Huésped Anónimo",
    });

    setCalificarLoading(false);

    if (res.success) {
      setCalificacionGuardadaExito(true);
      // Simular la actualización de la calificación en el estado local de la reserva
      setReserva({
        ...reserva,
        calificacion: {
          estrellas: estrellasSeleccionadas,
          comentario: comentarioOpinion,
          nombreAutor: autorNombre.trim() || reserva.cliente?.nombre,
        },
      });
      setShowCalificacionModal(false);
    } else {
      setCalificacionError(res.error || "Error al registrar la calificación en la base de datos.");
    }
  };

  const handleGuardarPreferencia = async (servicio: "almuerzo" | "cena", opcion: string) => {
    if (!reserva || !reserva.servicios || reserva.servicios.length === 0) return;
    const sId = reserva.servicios[0].id;

    if (servicio === "almuerzo") setPreferenciaAlmuerzo(opcion);
    if (servicio === "cena") setPreferenciaCena(opcion);

    const res = await guardarPreferenciaPlatoAction(reserva.id, sId, servicio, opcion);
    if (res.success) {
      setGuardadoPreferenciaExito(true);
      setTimeout(() => setGuardadoPreferenciaExito(false), 3000);
    }
  };

  const handleToggleRenuncia = async (servicio: "desayuno" | "almuerzo" | "cena") => {
    if (!reserva || !reserva.servicios || reserva.servicios.length === 0) return;
    const sId = reserva.servicios[0].id;

    let nuevoVal = false;
    if (servicio === "desayuno") {
      nuevoVal = !renunciaDesayuno;
      setRenunciaDesayuno(nuevoVal);
    }
    if (servicio === "almuerzo") {
      nuevoVal = !renunciaAlmuerzo;
      setRenunciaAlmuerzo(nuevoVal);
    }
    if (servicio === "cena") {
      nuevoVal = !renunciaCena;
      setRenunciaCena(nuevoVal);
    }

    await renunciarServicioAction(reserva.id, sId, servicio, nuevoVal);
  };

  const handleEnviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalleSolicitud || !reserva) return;

    setIsLoading(true);
    const mensajeCompleto = `[Solicitud Huésped - ${tipoSolicitud}] ${detalleSolicitud}`;
    const res = await solicitarCambioHuesped(reserva.codigoReserva || reserva.id, mensajeCompleto);
    setIsLoading(false);

    if (res.success) {
      setSolicitudEnviada(true);
      setReserva({ ...reserva, solicitudCambio: mensajeCompleto });
      setShowSolicitudModal(false);
    }
  };

  // Cómputo de Fechas y Precios del Huésped
  let noches = 1;
  let precioNoche = 25000;
  let totalHospedaje = 25000;
  let totalAlimentacion = 0;
  let totalGeneral = 25000;
  let desayunosCant = 0;
  let colacionesCant = 0;
  let cenasCant = 0;
  let restriccion = "";

  if (reserva) {
    const checkIn = new Date(reserva.fechaCheckIn).getTime();
    const checkOut = new Date(reserva.fechaCheckOut).getTime();
    const diffTime = Math.abs(checkOut - checkIn);
    noches = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    precioNoche = Number(reserva.habitacion?.precioBase || 25000);
    totalHospedaje = precioNoche * noches;

    if (reserva.servicios && reserva.servicios.length > 0) {
      const s = reserva.servicios[0];
      desayunosCant = s.desayunosCant || 0;
      colacionesCant = s.colacionesCant || 0;
      cenasCant = s.cenasCant || 0;
      restriccion = s.restriccionDietaria || "";

      totalAlimentacion = (desayunosCant * 4000 + colacionesCant * 6000 + cenasCant * 8000) * noches;
    }

    totalGeneral = totalHospedaje + totalAlimentacion;
  }

  let horasParaCheckIn = 999;
  if (reserva) {
    const now = new Date().getTime();
    const checkIn = new Date(reserva.fechaCheckIn).getTime();
    horasParaCheckIn = (checkIn - now) / (1000 * 3600);
  }

  const permiteCambioFechasDirecto = horasParaCheckIn > 24 && reserva?.estado !== "EN_CURSO" && reserva?.estado !== "FINALIZADA";

  // Lógica para permitir calificar (desde 1 día antes del Check-out)
  let permiteCalificar = false;
  if (reserva) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const checkOut = new Date(reserva.fechaCheckOut);
    checkOut.setHours(0, 0, 0, 0);

    const unDiaEnMs = 24 * 60 * 60 * 1000;
    const limiteCalificacion = new Date(checkOut.getTime() - unDiaEnMs);

    permiteCalificar = hoy >= limiteCalificacion;
  }

  // Descarga de PDF desde el Portal
  const handleDescargarPDF = () => {
    if (!reserva) return;

    const doc = new jsPDF();
    const codigoRes = reserva.codigoReserva || `RES-${reserva.id.slice(0, 8)}`;

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
    doc.text(`Nombre Completo: ${reserva.cliente?.nombre}`, 14, 83);
    doc.text(`Teléfono: ${reserva.cliente?.telefono}`, 14, 89);
    if (reserva.cliente?.rutPasaporte) doc.text(`RUT / Pasaporte: ${reserva.cliente.rutPasaporte}`, 14, 95);
    doc.text(`Tipo de Cliente: ${reserva.cliente?.tipo === "TRABAJADOR_FAENA" ? "Trabajador de Faena" : "Turista"}`, 14, reserva.cliente?.rutPasaporte ? 101 : 95);
    if (reserva.cliente?.empresa) doc.text(`Empresa: ${reserva.cliente.empresa}`, 14, reserva.cliente?.rutPasaporte ? 107 : 101);

    autoTable(doc, {
      startY: reserva.cliente?.empresa ? 115 : 103,
      head: [["Detalle de la Reserva", "Información Registrada"]],
      body: [
        ["Estado Actual", reserva.estado],
        ["Habitación Asignada", `${reserva.habitacion?.numero} (${reserva.habitacion?.capacidad} cama(s))`],
        ["Fecha Check-in", formatDateCL(reserva.fechaCheckIn)],
        ["Fecha Check-out", formatDateCL(reserva.fechaCheckOut)],
        ["Duración", `${noches} noche(s)`],
        ["Subtotal Hospedaje", formatCLP(totalHospedaje)],
        ["Servicios de Comida", `Desayunos: ${desayunosCant} | Viandas: ${colacionesCant} | Cenas: ${cenasCant}`],
        ["Restricciones Dietarias", restriccion || "Sin observaciones"],
        ["TOTAL ESTIMADO FINAL", formatCLP(totalGeneral)],
      ],
      theme: "grid",
      headStyles: { fillColor: [217, 88, 59], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9.5, cellPadding: 3.5 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Guarda este documento para tu estadía en Paposo:", 14, finalY);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 88, 59);
    doc.text("http://pensionmyriam.cl/mi-reserva", 14, finalY + 6);

    doc.save(`Comprobante_Reserva_${codigoRes}.pdf`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 select-none">
      {/* 1. FORMULARIO DE CONSULTA INICIAL (CUANDO NO HAY RESERVA BUSCADA) */}
      {!reserva && (
        <div className="bg-card border border-sand-border rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-terracotta text-white grid place-items-center font-serif font-bold text-2xl shadow-lg mx-auto">
            🔑
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              Portal del Huésped · Consulta tu Reserva
            </h1>
            <p className="text-muted text-xs sm:text-sm">
              Ingresa el código único de reserva (ej. <span className="font-mono font-bold text-terracotta">RES-2026-755205</span>) y tu teléfono o nombre.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-left">
              ⚠️ {errorMessage}
            </div>
          )}

          <form onSubmit={handleConsultar} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Código de Reserva *
              </label>
              <input
                type="text"
                required
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value.toUpperCase())}
                placeholder="Ej. RES-2026-755205"
                className="w-full p-3.5 rounded-2xl border border-sand-border bg-white text-ink font-mono font-bold text-sm outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Teléfono o Nombre del Huésped *
              </label>
              <input
                type="text"
                required
                value={contactoInput}
                onChange={(e) => setContactoInput(e.target.value)}
                placeholder="+56 9 9876 5432 o Carlos..."
                className="w-full p-3.5 rounded-2xl border border-sand-border bg-white text-ink text-sm outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold py-4 rounded-full shadow-lg text-sm transition-all hover:scale-[1.01]"
            >
              {isLoading ? "Buscando..." : "🔍 Consultar Reserva en Vivo"}
            </button>
          </form>
        </div>
      )}

      {/* 2. VISTA COMPLETA DEL PORTAL DEL HUÉSPED CON BARRA DE PROGRESO Y LAS 3 TARJETAS + MENÚ DEL DÍA */}
      {reserva && (
        <div className="space-y-8">
          {/* BARRA DE PROGRESO DE 4 PASOS + CÓDIGO DESTACADO */}
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-sand-border/60 pb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold bg-terracotta/10 text-terracotta px-3 py-1 rounded-full border border-terracotta/20">
                    {reserva.codigoReserva || `RES-${reserva.id.slice(0, 8)}`}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getEstadoReservaBadge(reserva.estado).className}`}>
                    {getEstadoReservaBadge(reserva.estado).label}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-2">
                  ¡Hola, {reserva.cliente?.nombre}! 🏠
                </h1>
                <p className="text-muted text-xs sm:text-sm mt-0.5">
                  Estadía del {formatDateCL(reserva.fechaCheckIn)} al {formatDateCL(reserva.fechaCheckOut)} ({noches} noche(s)).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setShowMenuModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs px-5 py-3 rounded-full shadow-md transition-all flex items-center gap-2"
                >
                  <span>🍽️ Ver Menú del Día de mi Estadía</span>
                </button>

                <button
                  onClick={handleDescargarPDF}
                  className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold text-xs px-5 py-3 rounded-full shadow-md transition-all flex items-center gap-2"
                >
                  <span>📄 Descargar Comprobante (PDF)</span>
                </button>

                <button
                  onClick={() => setReserva(null)}
                  className="bg-sand-deep hover:bg-sand-border text-ink font-semibold text-xs px-4 py-3 rounded-full border border-sand-border transition-all"
                >
                  🚪 Salir
                </button>
              </div>
            </div>

            {/* BARRA DE PROGRESO EN 4 ETAPAS */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-muted">
                Estado del Flujo de Reserva
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-cactus/10 border border-cactus/30 text-cactus font-bold space-y-1">
                  <div className="flex items-center justify-between">
                    <span>1. Registrada</span>
                    <span>✓</span>
                  </div>
                  <div className="text-[11px] text-cactus/90 font-normal">Recibida en el sistema</div>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-1 ${reserva.estado === "CONFIRMADA" || reserva.estado === "EN_CURSO" || reserva.estado === "FINALIZADA" ? "bg-cactus/10 border-cactus/30 text-cactus font-bold" : "bg-amber-50 border-amber-300 text-amber-900"}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>2. Confirmación</span>
                    <span>{reserva.estado === "CONFIRMADA" ? "✓" : "⏳"}</span>
                  </div>
                  <div className="text-[11px] font-normal">
                    {reserva.estado === "PENDIENTE" ? "Pendiente Sra. Myriam" : "Confirmada por la Pensión"}
                  </div>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-1 ${reserva.estado === "EN_CURSO" ? "bg-cactus text-white font-bold" : "bg-sand-deep/20 border-sand-border text-muted"}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>3. En Estadía</span>
                    <span>🛏️</span>
                  </div>
                  <div className="text-[11px] font-normal">Alojando en Paposo</div>
                </div>

                <div className={`p-3.5 rounded-2xl border space-y-1 ${reserva.estado === "FINALIZADA" ? "bg-ink text-white font-bold" : "bg-sand-deep/20 border-sand-border text-muted"}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>4. Finalizada</span>
                    <span>🏁</span>
                  </div>
                  <div className="text-[11px] font-normal">Check-out completado</div>
                </div>
              </div>
            </div>

            {solicitudEnviada && (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-semibold">
                ✅ Tu solicitud de cambio ha sido enviada con éxito a la administración de la Sra. Myriam.
              </div>
            )}
          </div>

          {/* SECCIÓN DE CALIFICACIÓN Y OPINIÓN (Live ratings module) */}
          {permiteCalificar && (
            <div className="rounded-3xl p-6 border-2 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              style={{
                background: reserva.calificacion ? "rgba(30,173,80,0.06)" : "rgba(217,88,59,0.06)",
                borderColor: reserva.calificacion ? "rgba(30,173,80,0.3)" : "rgba(217,88,59,0.3)"
              }}
            >
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: reserva.calificacion ? "#1EAD50" : "#D9583B" }}>
                  ⭐ {reserva.calificacion ? "Estadía Calificada" : "Tu opinión nos importa"}
                </span>
                <h3 className="font-serif font-bold text-[#2A2418] text-lg sm:text-xl">
                  {reserva.calificacion ? "¡Muchas gracias por tu valoración!" : "¿Cómo ha sido tu experiencia en la Pensión?"}
                </h3>
                <p className="text-[#7A6F5A] text-xs sm:text-sm max-w-2xl">
                  {reserva.calificacion 
                    ? "Tu opinión ha sido registrada exitosamente y se publicará en la página de inicio para ayudar a otros viajeros."
                    : "Ya falta poco para que termine tu estadía o está en curso. Déjanos tu valoración de estrellas para ayudarnos a seguir mejorando."}
                </p>
              </div>

              {!reserva.calificacion ? (
                <button
                  type="button"
                  onClick={() => setShowCalificacionModal(true)}
                  className="bg-terracotta hover:bg-terracotta-deep text-white font-bold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap self-stretch md:self-auto justify-center text-xs"
                >
                  <span>⭐ ¡Da tu opinión!</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-cactus/15 text-cactus px-4 py-2.5 rounded-2xl text-xs font-bold border border-cactus/20 self-stretch md:self-auto justify-center">
                  <span className="text-amber-500">{"★".repeat(reserva.calificacion.estrellas) + "☆".repeat(5 - reserva.calificacion.estrellas)}</span>
                  <span>Registrada</span>
                </div>
              )}
            </div>
          )}

          {/* GRID PRINCIPAL DE 3 TARJETAS ESTRUCTURADAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TARJETA 1: ESTADÍA & HABITACIÓN */}
            <div className="bg-card border border-sand-border rounded-3xl p-6 shadow-md space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-sand-border/60 pb-3">
                  <h3 className="font-serif font-bold text-lg text-ink">
                    🛏️ Estadía & Habitación
                  </h3>
                  <span className="text-xs font-bold text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
                    {noches} Noche(s)
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="bg-sand-deep/30 p-3.5 rounded-2xl border border-sand-border">
                    <span className="text-muted text-[10px] uppercase tracking-wider font-semibold block">Habitación Reservada</span>
                    <div className="font-serif font-bold text-ink text-base mt-0.5">
                      {reserva.habitacion?.numero} ({reserva.habitacion?.capacidad} cama(s))
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-xl border border-sand-border">
                      <span className="text-muted text-[10px] uppercase font-semibold block">📅 Check-in</span>
                      <div className="font-serif font-bold text-ink text-xs mt-0.5">
                        {formatDateCL(reserva.fechaCheckIn)}
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-sand-border">
                      <span className="text-muted text-[10px] uppercase font-semibold block">🚪 Check-out</span>
                      <div className="font-serif font-bold text-cactus text-xs mt-0.5">
                        {formatDateCL(reserva.fechaCheckOut)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-sand-border/60 text-xs flex justify-between items-center text-muted">
                <span>Valor por noche:</span>
                <strong className="text-ink font-serif text-sm">{formatCLP(precioNoche)}</strong>
              </div>
            </div>

            {/* TARJETA 2: SERVICIOS DE ALIMENTACIÓN + BOTÓN AL MENÚ DEL DÍA */}
            <div className="bg-card border border-sand-border rounded-3xl p-6 shadow-md space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-sand-border/60 pb-3">
                  <h3 className="font-serif font-bold text-lg text-ink">
                    🍽️ Comida Casera Diaria
                  </h3>
                  <span className="text-xs font-semibold text-muted">Por día</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl">
                    <span className="text-lg block">🥐</span>
                    <span className="text-[10px] text-amber-900 font-medium block">Desayuno</span>
                    <span className="font-bold text-ink text-base">{desayunosCant}</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl">
                    <span className="text-lg block">🍱</span>
                    <span className="text-[10px] text-emerald-900 font-medium block">Vianda</span>
                    <span className="font-bold text-emerald-800 text-base">{colacionesCant}</span>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-3 rounded-2xl">
                    <span className="text-lg block">🍲</span>
                    <span className="text-[10px] text-red-900 font-medium block">Cena</span>
                    <span className="font-bold text-ink text-base">{cenasCant}</span>
                  </div>
                </div>

                {restriccion && (
                  <div className="p-3 rounded-2xl bg-amber-100/60 border border-amber-300 text-amber-900 text-xs font-semibold">
                    ⚠️ Restricción Dietaria: {restriccion}
                  </div>
                )}

                <button
                  onClick={() => setShowMenuModal(true)}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-2xl text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>🍽️ Ver Platos y Elegir Preferencia</span>
                </button>
              </div>

              <div className="pt-3 border-t border-sand-border/60 text-xs flex justify-between items-center text-muted">
                <span>Alimentación por {noches} día(s):</span>
                <strong className="text-ink font-serif text-sm">{formatCLP(totalAlimentacion)}</strong>
              </div>
            </div>

            {/* TARJETA 3: RESUMEN FINANCIERO DESTACADO */}
            <div className="bg-card border-2 border-terracotta/40 rounded-3xl p-6 shadow-md space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="border-b border-sand-border/60 pb-3">
                  <span className="text-[10px] uppercase tracking-widest text-terracotta font-semibold">Desglose de Pago</span>
                  <h3 className="font-serif font-bold text-xl text-ink mt-0.5">
                    Total Estimado
                  </h3>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center text-ink">
                    <span>🛏️ Subtotal Hospedaje ({noches} n)</span>
                    <span className="font-semibold">{formatCLP(totalHospedaje)}</span>
                  </div>

                  <div className="flex justify-between items-center text-ink">
                    <span>🍽️ Subtotal Alimentación</span>
                    <span className="font-semibold">{formatCLP(totalAlimentacion)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-sand-deep/40 p-4 rounded-2xl border border-sand-border space-y-1 text-right">
                <span className="text-[11px] font-semibold uppercase text-terracotta tracking-wider">
                  Monto Total Estimado
                </span>
                <div className="font-serif font-bold text-3xl text-terracotta">
                  {formatCLP(totalGeneral)}
                </div>
              </div>
            </div>
          </div>

          {/* REGLAS Y VENTANAS DE TIEMPO + ACCIONES DE CAMBIO */}
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-sand-border/60 pb-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                  ⚙️ Políticas y Ventanas de Cambio
                </div>
                <h3 className="font-serif font-bold text-xl text-ink mt-0.5">
                  ¿Necesitas solicitar una modificación?
                </h3>
              </div>

              <button
                onClick={() => setShowSolicitudModal(true)}
                className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold text-xs px-6 py-3.5 rounded-full shadow-md transition-all hover:-translate-y-0.5"
              >
                📝 Solicitar Cambio a la Sra. Myriam
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="p-4 rounded-2xl bg-sand-deep/30 border border-sand-border space-y-1.5">
                <span className="font-bold text-ink">🕒 Cambios de Fecha / Cancelaciones (24 Horas)</span>
                <p className="text-muted text-xs leading-relaxed">
                  Permitidos hasta 24h antes del check-in.
                  {permiteCambioFechasDirecto ? (
                    <strong className="text-cactus block mt-1 font-semibold">🟢 Tu reserva cumple el plazo para solicitar modificaciones.</strong>
                  ) : (
                    <strong className="text-amber-800 block mt-1 font-semibold">⚠️ Falta menos de 24h para el check-in. Los cambios se coordinan vía telefónica.</strong>
                  )}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-sand-deep/30 border border-sand-border space-y-1.5">
                <span className="font-bold text-ink">🍳 Cambios de Menú o Raciones (Protección 4h)</span>
                <p className="text-muted text-xs leading-relaxed">
                  Los menús se preparan en horarios fijos. Los cambios de raciones deben notificarse con al menos 4 horas de anticipación a la Sra. Myriam.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SOLICITUD DE CAMBIO (FECHAS O SERVICIOS) */}
      {showSolicitudModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-sand-border pb-3">
              <h3 className="font-serif font-bold text-xl text-ink">📝 Solicitar Cambio</h3>
              <button onClick={() => setShowSolicitudModal(false)} className="text-muted text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviarSolicitud} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted font-semibold mb-1">Tipo de Modificación</label>
                <select
                  value={tipoSolicitud}
                  onChange={(e) => setTipoSolicitud(e.target.value)}
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none"
                >
                  <option value="FECHAS">📅 Cambiar Fechas de Estadía</option>
                  <option value="COMIDAS">🍽️ Ajustar Servicio de Alimentación</option>
                  <option value="CANCELACION">✕ Solicitar Cancelación</option>
                  <option value="OTRO">💬 Otro Requerimiento Especial</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Detalle de la Solicitud *</label>
                <textarea
                  required
                  rows={4}
                  value={detalleSolicitud}
                  onChange={(e) => setDetalleSolicitud(e.target.value)}
                  placeholder="Ej. Solicito mover check-in para el 15 de agosto por motivos laborales..."
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold py-3.5 rounded-full shadow-md text-xs"
              >
                {isLoading ? "Enviando..." : "✨ Enviar Solicitud a Sra. Myriam"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VER MENÚ DEL DÍA DE MI ESTADÍA CON OPCIONES Y PREFERENCIAS */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-sand-border pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-terracotta tracking-wider">
                  Menú Oficial de la Pensión
                </span>
                <h3 className="font-serif font-bold text-xl text-ink">🍽️ Menú del Día de tu Estadía</h3>
              </div>
              <button onClick={() => setShowMenuModal(false)} className="text-muted text-lg font-bold">
                ✕
              </button>
            </div>

            {guardadoPreferenciaExito && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                ✓ Tu preferencia ha sido guardada y notificada a la cocina.
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* DESAYUNO */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex justify-between font-bold text-amber-900">
                  <span>🥐 Desayuno Casero</span>
                  <span className="font-mono text-[10px] bg-amber-200/70 px-2 py-0.5 rounded">
                    ⏰ {menuDiaGeneral?.horarioDesayuno || "08:00 - 09:30"}
                  </span>
                </div>
                <p className="text-ink/80 leading-relaxed font-medium">
                  {menuDiaGeneral?.desayunoTexto || "Pan amasado casero recién horneado, huevos revueltos de campo y té/café."}
                </p>
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-muted text-[11px]">¿Desayunarás hoy?</span>
                  <button
                    onClick={() => handleToggleRenuncia("desayuno")}
                    className={`text-[10px] px-3 py-1 rounded-full font-bold ${
                      renunciaDesayuno ? "bg-stone-300 text-stone-700" : "bg-amber-200 text-amber-900"
                    }`}
                  >
                    {renunciaDesayuno ? "✕ No desayunaré" : "✓ Sí, asistiré"}
                  </button>
                </div>
              </div>

              {/* ALMUERZO */}
              <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-3">
                <div className="flex justify-between font-bold text-orange-900">
                  <span>🍲 Almuerzo (2 Opciones)</span>
                  <span className="font-mono text-[10px] bg-orange-200/70 px-2 py-0.5 rounded">
                    ⏰ {menuDiaGeneral?.horarioAlmuerzo || "13:00 - 15:00"}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleGuardarPreferencia("almuerzo", menuDiaGeneral?.almuerzoOpcion1 || "Cazuela de pollo criolla")}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all font-semibold flex items-center justify-between ${
                      preferenciaAlmuerzo === (menuDiaGeneral?.almuerzoOpcion1 || "Cazuela de pollo criolla")
                        ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                        : "bg-white border-orange-200 text-ink"
                    }`}
                  >
                    <span>🍲 Opción 1: {menuDiaGeneral?.almuerzoOpcion1 || "Cazuela de pollo criolla"}</span>
                    {preferenciaAlmuerzo === (menuDiaGeneral?.almuerzoOpcion1 || "Cazuela de pollo criolla") && <span>✓ Elegido</span>}
                  </button>

                  <button
                    onClick={() => handleGuardarPreferencia("almuerzo", menuDiaGeneral?.almuerzoOpcion2 || "Pescado frito del día")}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all font-semibold flex items-center justify-between ${
                      preferenciaAlmuerzo === (menuDiaGeneral?.almuerzoOpcion2 || "Pescado frito del día")
                        ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                        : "bg-white border-orange-200 text-ink"
                    }`}
                  >
                    <span>🐟 Opción 2: {menuDiaGeneral?.almuerzoOpcion2 || "Pescado frito del día con ensalada"}</span>
                    {preferenciaAlmuerzo === (menuDiaGeneral?.almuerzoOpcion2 || "Pescado frito del día") && <span>✓ Elegido</span>}
                  </button>
                </div>
              </div>

              {/* CENA */}
              <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200 space-y-3">
                <div className="flex justify-between font-bold text-red-900">
                  <span>🍽️ Cena Tradicional (2 Opciones)</span>
                  <span className="font-mono text-[10px] bg-red-200/70 px-2 py-0.5 rounded">
                    ⏰ {menuDiaGeneral?.horarioCena || "20:00 - 21:30"}
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleGuardarPreferencia("cena", menuDiaGeneral?.cenaOpcion1 || "Consomé de ave casero")}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all font-semibold flex items-center justify-between ${
                      preferenciaCena === (menuDiaGeneral?.cenaOpcion1 || "Consomé de ave casero")
                        ? "bg-red-600 text-white border-red-700 shadow-xs"
                        : "bg-white border-red-200 text-ink"
                    }`}
                  >
                    <span>🥣 Opción 1: {menuDiaGeneral?.cenaOpcion1 || "Consomé de ave + pan amasado"}</span>
                    {preferenciaCena === (menuDiaGeneral?.cenaOpcion1 || "Consomé de ave casero") && <span>✓ Elegido</span>}
                  </button>

                  <button
                    onClick={() => handleGuardarPreferencia("cena", menuDiaGeneral?.cenaOpcion2 || "Plato ligero: Arroz con pollo")}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all font-semibold flex items-center justify-between ${
                      preferenciaCena === (menuDiaGeneral?.cenaOpcion2 || "Plato ligero: Arroz con pollo")
                        ? "bg-red-600 text-white border-red-700 shadow-xs"
                        : "bg-white border-red-200 text-ink"
                    }`}
                  >
                    <span>🍚 Opción 2: {menuDiaGeneral?.cenaOpcion2 || "Plato ligero: Arroz con pollo"}</span>
                    {preferenciaCena === (menuDiaGeneral?.cenaOpcion2 || "Plato ligero: Arroz con pollo") && <span>✓ Elegido</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CALIFICACIÓN POR ESTRELLAS */}
      {showCalificacionModal && reserva && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
            <button 
              type="button" 
              onClick={() => setShowCalificacionModal(false)}
              className="absolute top-4 right-4 text-ink hover:text-terracotta text-2xl font-bold bg-sand-deep/40 w-10 h-10 rounded-full grid place-items-center transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-terracotta">⭐ Danos tu Calificación</span>
              <h3 className="font-serif font-bold text-ink text-xl sm:text-2xl">Califica tu Estadía 🏠</h3>
              <p className="text-muted text-xs">
                Tu opinión es de gran valor para la Señora Myriam y nos ayuda a seguir brindando un excelente servicio en Paposo.
              </p>
            </div>

            {calificacionError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                ⚠️ {calificacionError}
              </div>
            )}

            <form onSubmit={handleEnviarCalificacion} className="space-y-4">
              {/* Estrellas Interactivas */}
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <span className="text-[11px] uppercase tracking-wider text-muted font-bold">¿Cuántas estrellas nos das?</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEstrellasSeleccionadas(star)}
                      className="text-3xl focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <span style={{ color: star <= estrellasSeleccionadas ? "#f59e0b" : "#ccc" }}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-ink">
                  {estrellasSeleccionadas === 5 ? "¡Excelente! (5/5)" : estrellasSeleccionadas === 4 ? "Muy Bueno (4/5)" : estrellasSeleccionadas === 3 ? "Aceptable (3/5)" : estrellasSeleccionadas === 2 ? "Regular (2/5)" : "Insatisfactorio (1/5)"}
                </span>
              </div>

              {/* Nombre de Autor */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Nombre Visible *</label>
                <input
                  type="text"
                  required
                  value={autorNombre}
                  onChange={(e) => setAutorNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez..."
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink text-xs font-semibold outline-none"
                />
              </div>

              {/* Comentario */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-1">Tu Comentario / Opinión *</label>
                <textarea
                  required
                  rows={4}
                  value={comentarioOpinion}
                  onChange={(e) => setComentarioOpinion(e.target.value)}
                  placeholder="Escribe aquí tu opinión sobre la comida, la pieza y la atención de la Señora Myriam..."
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink text-xs outline-none resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={calificarLoading}
                  className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-bold py-3.5 rounded-full shadow-md text-xs transition-all flex items-center justify-center gap-2"
                >
                  {calificarLoading ? "Guardando opinión..." : "✨ Publicar mi opinión"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
