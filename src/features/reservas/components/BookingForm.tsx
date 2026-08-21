"use client";

import { useState } from "react";
import Image from "next/image";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { crearSolicitudReserva } from "../actions/reservas";
import { formatCLP, formatDateCL } from "@/shared/utils/formatters";
import { HabitacionDTO } from "@/features/habitaciones/types";

interface ReservaExistenteDTO {
  habitacionId: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
}

interface BookingFormProps {
  habitaciones: HabitacionDTO[];
  reservasExistentes?: ReservaExistenteDTO[];
}

interface DetallesRicos {
  nombre: string;
  capacidadDetalle: string;
  equipamiento: string[];
  notas: string;
  fotos: string[];
}

const getHabitacionDetalles = (numero: string): DetallesRicos => {
  const num = numero.replace(/[^0-9]/g, ""); // Extraer solo el número
  
  if (num === "1") {
    return {
      nombre: "Pieza Matrimonial Vista al Mar",
      capacidadDetalle: "Hasta 2 personas (1 Cama Matrimonial)",
      equipamiento: ["🚿 Baño Privado", "📶 WiFi Faena", "🌊 Vista al Mar", "📺 TV Satelital", "🚪 Entrada Independiente"],
      notas: "Ideal para parejas o supervisores de faena. Mayor privacidad y excelente luz natural.",
      fotos: ["/images/habitacion.jpg", "/images/pasillo.jpg", "/images/comedor.jpg"],
    };
  }
  if (num === "2") {
    return {
      nombre: "Pieza Doble Familiar",
      capacidadDetalle: "Hasta 3 personas (1 Matrimonial + 1 Simple)",
      equipamiento: ["🚿 Baño Privado", "📶 WiFi Faena", "🏜️ Vista al Pueblo", "🧣 Calefacción", "☕ Cafetera"],
      notas: "Excelente opción para contratistas o familias. Espaciosa y acogedora.",
      fotos: ["/images/comedor.jpg", "/images/habitacion.jpg", "/images/pasillo.jpg"],
    };
  }
  if (num === "3") {
    return {
      nombre: "Pieza Single Operativa",
      capacidadDetalle: "Hasta 1 persona (1 Cama Individual)",
      equipamiento: ["🛁 Baño Compartido", "📶 WiFi Faena", "🏜️ Vista al Pueblo", "💼 Escritorio", "👕 Closet"],
      notas: "Pensada para estancias individuales de trabajadores de faena. Económica y tranquila.",
      fotos: ["/images/pasillo.jpg", "/images/comedor.jpg", "/images/IMAGENES.JPG"],
    };
  }
  return {
    nombre: "Pieza Doble Estándar",
    capacidadDetalle: "Hasta 2 personas (2 Camas Individuales)",
    equipamiento: ["🚿 Baño Privado", "📶 WiFi Faena", "🌊 Vista al Mar", "🚪 Entrada Independiente"],
    notes: "Confortable pieza doble para trabajadores que requieran descanso en camas independientes.",
    fotos: ["/images/IMAGENES.JPG", "/images/habitacion.jpg", "/images/comedor.jpg"],
  } as any;
};

export function BookingForm({ habitaciones, reservasExistentes = [] }: BookingFormProps) {
  // Fechas iniciales
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today.getTime() + 86400000 * 2);
  tomorrow.setHours(0, 0, 0, 0);

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // Rango de Selección
  const [checkInDate, setCheckInDate] = useState<Date>(today);
  const [checkOutDate, setCheckOutDate] = useState<Date>(tomorrow);

  // Estados para Selección Clic-a-Clic y Hover
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isSelectingCheckout, setIsSelectingCheckout] = useState<boolean>(false);

  // Habitación Seleccionada
  const [selectedHabitacionId, setSelectedHabitacionId] = useState<string>(
    habitaciones[0]?.id || ""
  );

  // Servicios de Alimentación
  const [desayunos, setDesayunos] = useState<number>(1);
  const [colaciones, setColaciones] = useState<number>(1);
  const [cenas, setCenas] = useState<number>(1);
  const [restricciones, setRestricciones] = useState<string>("");

  // Datos del Huésped
  const [nombre, setNombre] = useState<string>("");
  const [telefono, setTelefono] = useState<string>("");
  const [rut, setRut] = useState<string>("");
  const [tipoCliente, setTipoCliente] = useState<"TURISTA" | "TRABAJADOR_FAENA">(
    "TRABAJADOR_FAENA"
  );
  const [empresa, setEmpresa] = useState<string>("");

  // Paso y Estado de Carga
  const [paso, setPaso] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reservaResultado, setReservaResultado] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [galleryHabitacionId, setGalleryHabitacionId] = useState<string | null>(null);
  const [aceptaTerminos, setAceptaTerminos] = useState<boolean>(false);
  const [showTerminosModal, setShowTerminosModal] = useState<boolean>(false);
  const [metodoPago, setMetodoPago] = useState<"DEBITO" | "CREDITO" | "TRANSFERENCIA">("TRANSFERENCIA");
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [payStep, setPayStep] = useState<string>("");
  
  // Estados de Tarjeta Interactiva 3D
  const [cardNumero, setCardNumero] = useState<string>("");
  const [cardNombre, setCardNombre] = useState<string>("");
  const [cardExpiracion, setCardExpiracion] = useState<string>("");
  const [cardCvv, setCardCvv] = useState<string>("");
  const [isCardBack, setIsCardBack] = useState<boolean>(false);
  const [showCardForm, setShowCardForm] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const [offlineReservaPayload, setOfflineReservaPayload] = useState<any>(null);

  // Filtrar habitaciones por disponibilidad real en las fechas seleccionadas
  const habitacionesDisponibles = habitaciones.filter((h) => {
    if (isSelectingCheckout) return true; // Si está a medio camino, mostrar todas como referencia
    
    const tieneSolapamiento = reservasExistentes.some((r) => {
      if (r.habitacionId !== h.id) return false;

      const rIn = new Date(r.fechaCheckIn);
      rIn.setHours(0, 0, 0, 0);
      const rOut = new Date(r.fechaCheckOut);
      rOut.setHours(0, 0, 0, 0);

      return checkInDate < rOut && checkOutDate > rIn;
    });

    return !tieneSolapamiento;
  });

  // Cómputo de Noches y Precios
  const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
  const noches = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const habitacionSel = habitaciones.find((h) => h.id === selectedHabitacionId) || habitaciones[0];
  const precioNoche = Number(habitacionSel?.precioBase || 25000);
  const totalHospedaje = precioNoche * noches;

  // Precios Alimentación
  const totalDesayunos = desayunos * 4000 * noches;
  const totalColaciones = colaciones * 6000 * noches;
  const totalCenas = cenas * 8000 * noches;
  const totalAlimentacion = totalDesayunos + totalColaciones + totalCenas;
  const totalGeneral = totalHospedaje + totalAlimentacion;

  // Lógica del Calendario Grande
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth, year, month };
  };

  const { firstDay, daysInMonth, year, month } = getDaysInMonth(currentMonthDate);

  const getDateFromDay = (day: number) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // Validación de Estado de Día (Pasado u Ocupado)
  const isPastDay = (day: number) => {
    const d = getDateFromDay(day);
    return d.getTime() < today.getTime();
  };

  const isOccupiedDay = (day: number) => {
    const d = getDateFromDay(day);
    return reservasExistentes.some((r) => {
      if (r.habitacionId !== selectedHabitacionId) return false;
      const inD = new Date(r.fechaCheckIn);
      inD.setHours(0, 0, 0, 0);
      const outD = new Date(r.fechaCheckOut);
      outD.setHours(0, 0, 0, 0);
      return d >= inD && d < outD;
    });
  };

  // Eventos de Mouse con protección para días pasados u ocupados
  const handleMouseEnter = (day: number) => {
    if (isPastDay(day) || isOccupiedDay(day)) return;
    const d = getDateFromDay(day);
    setHoveredDate(d);
  };

  const handleClickDay = (day: number) => {
    if (isPastDay(day) || isOccupiedDay(day)) return;
    const d = getDateFromDay(day);

    if (!isSelectingCheckout) {
      // Primer Clic: Selecciona Check-in y limpia/iguala Check-out
      setCheckInDate(d);
      setCheckOutDate(d);
      setIsSelectingCheckout(true);
    } else {
      // Segundo Clic: Selecciona Check-out
      if (d > checkInDate) {
        // Validar si hay algún día ocupado en el rango seleccionado
        let tieneOcupado = false;
        let cursor = new Date(checkInDate.getTime() + 86400000);
        while (cursor < d) {
          const occupied = reservasExistentes.some((r) => {
            if (r.habitacionId !== selectedHabitacionId) return false;
            const inD = new Date(r.fechaCheckIn);
            inD.setHours(0, 0, 0, 0);
            const outD = new Date(r.fechaCheckOut);
            outD.setHours(0, 0, 0, 0);
            return cursor >= inD && cursor < outD;
          });
          if (occupied) {
            tieneOcupado = true;
            break;
          }
          cursor = new Date(cursor.getTime() + 86400000);
        }

        if (tieneOcupado) {
          // Si hay un día ocupado en medio, ese día pasa a ser el nuevo Check-in
          setCheckInDate(d);
          setCheckOutDate(d);
          setIsSelectingCheckout(true);
        } else {
          setCheckOutDate(d);
          setIsSelectingCheckout(false);
        }
      } else if (d.getTime() === checkInDate.getTime()) {
        // Mismo día: Selección de 1 noche por defecto
        setCheckOutDate(new Date(d.getTime() + 86400000));
        setIsSelectingCheckout(false);
      } else {
        // Clic en día anterior: Se vuelve el nuevo check-in
        setCheckInDate(d);
        setCheckOutDate(d);
        setIsSelectingCheckout(true);
      }
    }
  };

  const isCheckInDay = (day: number) => {
    const d = getDateFromDay(day);
    return d.getTime() === checkInDate.getTime();
  };

  const isCheckOutDay = (day: number) => {
    const d = getDateFromDay(day);
    // Solo mostrar check-out si ya se seleccionó y no estamos a la mitad del paso intermedio
    if (isSelectingCheckout) return false;
    return d.getTime() === checkOutDate.getTime();
  };

  const isInRange = (day: number) => {
    const d = getDateFromDay(day);

    // Si estamos a la mitad del click-to-click (esperando check-out)
    if (isSelectingCheckout && hoveredDate) {
      if (hoveredDate > checkInDate) {
        // Validar si el hover pasa por encima de un día ocupado
        let tieneOcupado = false;
        let cursor = new Date(checkInDate.getTime() + 86400000);
        while (cursor <= hoveredDate) {
          const occupied = reservasExistentes.some((r) => {
            if (r.habitacionId !== selectedHabitacionId) return false;
            const inD = new Date(r.fechaCheckIn);
            inD.setHours(0, 0, 0, 0);
            const outD = new Date(r.fechaCheckOut);
            outD.setHours(0, 0, 0, 0);
            return cursor >= inD && cursor < outD;
          });
          if (occupied) {
            tieneOcupado = true;
            break;
          }
          cursor = new Date(cursor.getTime() + 86400000);
        }
        if (!tieneOcupado) {
          return d > checkInDate && d < hoveredDate;
        }
      }
    }

    // Rango consolidado normal
    if (isSelectingCheckout) {
      return false;
    }

    return d > checkInDate && d < checkOutDate;
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const ejecutarCreacionConPago = async (estadoDePago: string) => {
    setIsLoading(true);
    const payload = {
      nombre,
      telefono,
      rut,
      tipo: tipoCliente,
      empresa,
      habitacionId: selectedHabitacionId,
      fechaCheckIn: checkInDate.toISOString().split("T")[0],
      fechaCheckOut: checkOutDate.toISOString().split("T")[0],
      servicios: [
        {
          fechaServicio: checkInDate.toISOString().split("T")[0],
          desayunosCant: desayunos,
          colacionesCant: colaciones,
          cenasCant: cenas,
          restriccionDietaria: restricciones,
        },
      ],
      metodoPago,
      estadoPago: estadoDePago,
      montoPagado: totalGeneral,
    };

    if (typeof window !== "undefined" && !navigator.onLine) {
      setIsLoading(false);
      setOfflineReservaPayload(payload);
      setShowOfflineModal(true);
      return;
    }

    try {
      const res = await crearSolicitudReserva(payload);
      setIsLoading(false);

      if (res.success) {
        setReservaResultado({
          ...res,
          metodoPago,
          estadoPago: estadoDePago,
          montoPagado: totalGeneral,
        });
        setPaso(3);
      } else {
        alert("Error al registrar la reserva: " + (res.error || "Intente nuevamente."));
      }
    } catch (err) {
      console.error("Error al registrar la reserva (red):", err);
      setIsLoading(false);
      setOfflineReservaPayload(payload);
      setShowOfflineModal(true);
    }
  };

  const handleSendOfflineBackup = (type: "whatsapp" | "sms") => {
    if (!offlineReservaPayload) return;
    
    const p = offlineReservaPayload;
    const checkInStr = p.fechaCheckIn;
    const checkOutStr = p.fechaCheckOut;
    
    const s = p.servicios[0] || {};
    const comidasStr = `Des: ${s.desayunosCant || 0} | Col: ${s.colacionesCant || 0} | Cen: ${s.cenasCant || 0}`;
    const habNum = habitacionSel?.numero || `ID: ${p.habitacionId}`;
    
    const textMsg = `Reserva Pensión Myriam:
Nombre: ${p.nombre}
Teléfono: ${p.telefono}
RUT: ${p.rut || "No informado"}
Habitación: ${habNum}
Entrada: ${checkInStr}
Salida: ${checkOutStr}
Servicios: ${comidasStr}
Método Pago: ${p.metodoPago}
Monto Total: $${p.montoPagado || 0}
(Enviado en modo sin conexión)`;

    const encodedText = encodeURIComponent(textMsg);
    const phoneNumber = "56940199049"; // Teléfono Sra. Myriam
    
    if (type === "whatsapp") {
      window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, "_blank");
    } else {
      window.open(`sms:+${phoneNumber}?body=${encodedText}`, "_blank");
    }
    
    setShowOfflineModal(false);
    alert("Se ha abierto la aplicación en tu celular. Por favor completa el envío del mensaje en tu teléfono para asegurar la reserva.");
  };

  // Submit Reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !telefono) return;

    if (metodoPago === "TRANSFERENCIA") {
      await ejecutarCreacionConPago("PENDIENTE");
    } else {
      // Activar formulario de ingreso de Tarjeta 3D
      setShowCardForm(true);
    }
  };

  // Confirmar y Procesar Pago con Tarjeta
  const handlePagarConTarjeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumero || !cardNombre || !cardExpiracion || !cardCvv) return;

    setShowCardForm(false);
    setIsPaying(true);
    setPayStep("CONECTANDO"); // Conectando con Transbank...
    
    setTimeout(() => {
      setPayStep("VERIFICANDO"); // Verificando fondos...
    }, 1200);

    setTimeout(() => {
      setPayStep("PROCESANDO"); // Procesando cobro...
    }, 2400);

    setTimeout(() => {
      setPayStep("EXITOSO"); // ¡Autorizado!
      setTimeout(async () => {
        setIsPaying(false);
        await ejecutarCreacionConPago("PAGADO");
      }, 1000);
    }, 3600);
  };

  const handleCopiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Descargar PDF Comprobante oficial
  const handleDescargarPDF = () => {
    if (!reservaResultado) return;
    const doc = new jsPDF();
    const codigoRes = reservaResultado.codigoReserva || `RES-${reservaResultado.id.slice(0, 8)}`;

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
    doc.text(`Nombre Completo: ${nombre}`, 14, 83);
    doc.text(`Teléfono: ${telefono}`, 14, 89);
    if (rut) doc.text(`RUT / Pasaporte: ${rut}`, 14, 95);
    doc.text(`Tipo de Cliente: ${tipoCliente === "TRABAJADOR_FAENA" ? "Trabajador de Faena" : "Turista"}`, 14, rut ? 101 : 95);
    if (empresa) doc.text(`Empresa: ${empresa}`, 14, rut ? 107 : 101);

    autoTable(doc, {
      startY: empresa ? 115 : 103,
      head: [["Detalle de la Reserva", "Información Registrada"]],
      body: [
        ["Estado Actual", "PENDIENTE DE CONFIRMACIÓN"],
        ["Habitación Asignada", `${habitacionSel?.numero} (${habitacionSel?.capacidad} cama(s))`],
        ["Fecha Check-in", formatDateCL(checkInDate)],
        ["Fecha Check-out", formatDateCL(checkOutDate)],
        ["Duración", `${noches} noche(s)`],
        ["Subtotal Hospedaje", formatCLP(totalHospedaje)],
        ["Servicios de Comida", `Desayunos: ${desayunos} | Viandas: ${colaciones} | Cenas: ${cenas}`],
        ["Restricciones Dietarias", restricciones || "Sin observaciones"],
        ["TOTAL ESTIMADO FINAL", formatCLP(totalGeneral)],
      ],
      theme: "grid",
      headStyles: { fillColor: [217, 88, 59], textColor: 255, fontStyle: "bold" },
      styles: { fontSize: 9.5, cellPadding: 3.5 },
    });

    doc.save(`Comprobante_Reserva_${codigoRes}.pdf`);
  };

  const getFotoHabitacion = (numero: string) => {
    if (numero.includes("1")) return "/images/habitacion.jpg";
    if (numero.includes("2")) return "/images/comedor.jpg";
    if (numero.includes("3")) return "/images/pasillo.jpg";
    return "/images/IMAGENES.JPG";
  };

  return (
    <div className="w-full space-y-8 select-none">
      {/* Indicador de Pasos del Wizard */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold max-w-md mx-auto px-2">
        <div className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border ${paso === 1 ? "bg-terracotta text-white border-terracotta" : "bg-card text-muted border-sand-border"}`}>
          <span>1. Fechas & Habitación</span>
        </div>
        <span className="text-muted hidden sm:inline">➔</span>
        <div className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full border ${paso === 2 ? "bg-terracotta text-white border-terracotta" : "bg-card text-muted border-sand-border"}`}>
          <span>2. Comida & Datos del Huésped</span>
        </div>
      </div>

      {paso === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SECCIÓN IZQUIERDA: CALENDARIO RESPONSIVO PARA MÓVILES Y DESKTOP */}
          <div className="lg:col-span-6 bg-card border border-sand-border rounded-3xl p-4 sm:p-8 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-sand-border/60 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-terracotta font-semibold">
                  Selección de Fechas
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink mt-0.5">
                  Elige tus Noches de Estadía
                </h2>
                <p className="text-muted text-xs mt-0.5">
                  Revisa disponibilidad en vivo. Toca el día de entrada y luego el de salida.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-sand-deep/40 px-3 py-1.5 rounded-full border border-sand-border self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                  className="w-7 h-7 rounded-full border border-sand-border bg-white hover:bg-terracotta hover:text-white grid place-items-center text-xs font-bold transition-colors"
                >
                  ❮
                </button>
                <span className="font-serif font-bold text-xs sm:text-sm text-ink min-w-[95px] text-center">
                  {monthNames[month]} {year}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                  className="w-7 h-7 rounded-full border border-sand-border bg-white hover:bg-terracotta hover:text-white grid place-items-center text-xs font-bold transition-colors"
                >
                  ❯
                </button>
              </div>
            </div>

            {/* LEYENDA DEL CALENDARIO */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] sm:text-[11px] bg-sand-deep/30 p-2.5 rounded-2xl border border-sand-border/70 justify-center">
              <div className="flex items-center gap-1.5 font-semibold text-ink">
                <span className="w-3 h-3 rounded-sm bg-terracotta inline-block shadow-xs"></span>
                <span>Tu Selección</span>
              </div>

              <div className="flex items-center gap-1.5 font-semibold text-red-700">
                <span className="w-3 h-3 rounded-sm bg-red-200 border border-red-400 inline-block"></span>
                <span>🔴 Ocupado</span>
              </div>

              <div className="flex items-center gap-1.5 font-semibold text-stone-500">
                <span className="w-3 h-3 rounded-sm bg-stone-300 border border-stone-400 inline-block"></span>
                <span>⬛ Día Pasado</span>
              </div>
            </div>

            {/* Grid del Calendario Adaptable a Celulares */}
            <div className="space-y-3">
              <div className="grid grid-cols-7 text-center text-[10px] sm:text-xs font-bold uppercase text-terracotta tracking-wider">
                <span>Dom</span><span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span>
              </div>

              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10 sm:h-14 md:h-16" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const isCheckIn = isCheckInDay(dayNum);
                  const isCheckOut = isCheckOutDay(dayNum);
                  const inRange = isInRange(dayNum);
                  const past = isPastDay(dayNum);
                  const occupied = isOccupiedDay(dayNum);

                  return (
                    <div
                      key={dayNum}
                      onMouseEnter={() => handleMouseEnter(dayNum)}
                      onClick={() => handleClickDay(dayNum)}
                      className={`h-11 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center border ${
                        past
                          ? "bg-stone-200/70 border-stone-300 text-stone-400 cursor-not-allowed line-through"
                          : occupied
                          ? "bg-red-100 border-red-300 text-red-700 cursor-not-allowed font-extrabold opacity-80"
                          : isCheckIn
                          ? "bg-terracotta text-white border-terracotta shadow-md scale-105 cursor-pointer"
                          : isCheckOut
                          ? "bg-cactus text-white border-cactus shadow-md scale-105 cursor-pointer"
                          : inRange
                          ? "bg-terracotta/20 text-terracotta border-terracotta/40 font-extrabold cursor-pointer"
                          : "bg-white border-sand-border hover:border-terracotta/50 text-ink hover:bg-sand-deep/30 cursor-pointer"
                      }`}
                    >
                      <span>{dayNum}</span>

                      {isCheckIn && !past && !occupied && (
                        <span className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-widest text-white/90 hidden sm:inline">
                          Check-in
                        </span>
                      )}

                      {isCheckOut && !past && !occupied && (
                        <span className="text-[7px] sm:text-[8px] font-semibold uppercase tracking-widest text-white/90 hidden sm:inline">
                          Check-out
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Resumen Táctil de Fechas Seleccionadas */}
            <div className="p-4 rounded-2xl bg-sand-deep/40 border border-sand-border space-y-2 text-xs">
              <div className="flex justify-between items-center text-ink font-semibold">
                <span>Estadía Seleccionada:</span>
                <span className="font-serif font-bold text-terracotta text-sm">
                  {isSelectingCheckout ? "Esperando Check-out..." : `${noches} Noche(s)`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted text-[11px]">
                <div>Entrada: <strong className="text-ink">{formatDateCL(checkInDate)}</strong></div>
                <div>Salida: <strong className="text-ink">{isSelectingCheckout ? "Elige el día de salida" : formatDateCL(checkOutDate)}</strong></div>
              </div>
            </div>
          </div>

          {/* SECCIÓN DERECHA: TARJETAS VISUALES DE HABITACIONES */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-terracotta font-semibold">
                Selección de Pieza
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-ink">
                Elige tu Habitación Independiente
              </h2>
            </div>

            <div className="space-y-4">
              {habitacionesDisponibles.length === 0 ? (
                <div className="p-6 text-center bg-red-50/50 border border-red-200 rounded-3xl space-y-2">
                  <div className="text-2xl">⚠️</div>
                  <h3 className="font-serif font-bold text-red-800 text-base">Sin disponibilidad</h3>
                  <p className="text-muted text-xs">
                    Lo sentimos, no hay habitaciones libres para el rango de fechas seleccionado. Por favor, selecciona otras fechas en el calendario.
                  </p>
                </div>
              ) : (
                habitacionesDisponibles.map((h) => {
                  const isSelected = h.id === selectedHabitacionId;
                  const detalles = getHabitacionDetalles(h.numero);
                  const fotoUrl = detalles.fotos[0];
                  const totalHospedajePieza = h.precioBase * noches;

                  return (
                    <div
                      key={h.id}
                      onClick={() => setSelectedHabitacionId(h.id)}
                      className={`bg-card border-2 rounded-3xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer flex flex-col sm:flex-row gap-4 items-stretch group ${
                        isSelected
                          ? "border-terracotta ring-2 ring-terracotta/20 bg-amber-50/20 shadow-md scale-[1.01]"
                          : "border-[#ddd0b3] hover:border-terracotta/50 hover:shadow-md"
                      }`}
                    >
                      {/* Imagen con Badge de Capacidad y botón de galería */}
                      <div className="relative w-full sm:w-44 h-36 sm:h-auto shrink-0 overflow-hidden bg-sand-deep/30">
                        <Image
                          src={fotoUrl}
                          alt={detalles.nombre}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                          👥 {detalles.capacidadDetalle}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setGalleryHabitacionId(h.id);
                          }}
                          className="absolute bottom-2.5 right-2.5 bg-white/90 hover:bg-white text-ink text-[10px] font-semibold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 transition-all duration-200"
                        >
                          📷 Ver fotos
                        </button>
                      </div>

                      {/* Información Detallada */}
                      <div className="p-5 flex flex-col justify-between w-full space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a6f5a]">
                              {h.numero}
                            </span>
                            <span className="font-serif font-bold text-terracotta text-sm sm:text-base">
                              {formatCLP(h.precioBase)} <span className="text-[10px] text-muted font-sans font-normal">/ noche</span>
                            </span>
                          </div>
                          <h3 className="font-serif font-bold text-[#2a2418] text-base sm:text-lg">{detalles.nombre}</h3>
                          <p className="text-[#7a6f5a] text-[11px] leading-relaxed italic">
                            💡 {detalles.notas}
                          </p>
                        </div>

                        {/* Equipamiento */}
                        <div className="flex flex-wrap gap-1.5 text-[9px]">
                          {detalles.equipamiento.map((eq, i) => (
                            <span key={i} className="bg-sand-deep/40 text-ink px-2.5 py-1 rounded-md font-bold border border-[#ddd0b3]/60">
                              {eq}
                            </span>
                          ))}
                        </div>

                        {/* Subtotal y Acción de Selección */}
                        <div className="pt-3 border-t border-sand-border/30 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-[11px] text-[#7a6f5a]">
                            Total por {noches} {noches === 1 ? "noche" : "noches"}: <strong className="text-[#2a2418] font-serif text-sm">{formatCLP(totalHospedajePieza)}</strong>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedHabitacionId(h.id);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? "bg-[#1EAD50] text-white shadow-xs"
                                : "bg-white text-ink border border-sand-border hover:bg-sand-deep/50"
                            }`}
                          >
                            {isSelected ? "✓ Seleccionada" : "Elegir esta habitación"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setPaso(2)}
              className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold py-4 rounded-full shadow-lg text-sm sm:text-base transition-all hover:-translate-y-0.5"
            >
              Continuar a Comida y Datos →
            </button>
          </div>
        </div>
      )}

      {paso === 2 && (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-card border border-sand-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="border-b border-sand-border pb-4">
            <span className="text-[10px] uppercase font-bold text-terracotta tracking-wider">
              Paso 2 de 2
            </span>
            <h2 className="text-2xl font-serif font-bold text-ink">Comida Casera y Datos del Huésped</h2>
          </div>

          {/* SERVICIOS DE ALIMENTACIÓN */}
          <div className="space-y-4">
            <span className="font-bold text-ink text-sm block">🍽️ Plan de Comida Casera (Raciones Diarias)</span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <span className="font-bold text-amber-900 block">🥐 Desayuno ($4.000)</span>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setDesayunos(Math.max(0, desayunos - 1))} className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-bold text-sm">
                    -
                  </button>
                  <span className="font-bold text-base">{desayunos}</span>
                  <button type="button" onClick={() => setDesayunos(desayunos + 1)} className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-bold text-sm">
                    +
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 block">🥪 Vianda Faena ($6.000)</span>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setColaciones(Math.max(0, colaciones - 1))} className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-900 font-bold text-sm">
                    -
                  </button>
                  <span className="font-bold text-base">{colaciones}</span>
                  <button type="button" onClick={() => setColaciones(colaciones + 1)} className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-900 font-bold text-sm">
                    +
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                <span className="font-bold text-red-900 block">🍲 Cena ($8.000)</span>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => setCenas(Math.max(0, cenas - 1))} className="w-8 h-8 rounded-lg bg-red-200 text-red-900 font-bold text-sm">
                    -
                  </button>
                  <span className="font-bold text-base">{cenas}</span>
                  <button type="button" onClick={() => setCenas(cenas + 1)} className="w-8 h-8 rounded-lg bg-red-200 text-red-900 font-bold text-sm">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DATOS PERSONALES */}
          <div className="space-y-4 pt-2 text-xs">
            <span className="font-bold text-ink text-sm block">👤 Datos del Huésped / Empresa</span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez..."
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Teléfono Móvil *</label>
                <input
                  type="text"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+56 9 9876 5432..."
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-semibold mb-1">Tipo de Huésped</label>
                <select
                  value={tipoCliente}
                  onChange={(e) => setTipoCliente(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none font-semibold"
                >
                  <option value="TRABAJADOR_FAENA">👷 Trabajador de Faena / Empresa</option>
                  <option value="TURISTA">🌴 Turista / Particular</option>
                </select>
              </div>

              <div>
                <label className="block text-muted font-semibold mb-1">Empresa / Contratista (Opcional)</label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  placeholder="Ej. Constructora del Norte..."
                  className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none"
                />
              </div>
            </div>
          </div>

          {/* TÉRMINOS Y CONDICIONES CHECKBOX */}
          <div className="pt-4 pb-1 border-t border-sand-border/30">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                required
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-1 h-4.5 w-4.5 rounded border-sand-border text-terracotta focus:ring-terracotta accent-terracotta cursor-pointer shrink-0"
              />
              <span className="text-[11px] text-muted leading-relaxed font-medium group-hover:text-ink transition-colors">
                He leído y acepto los{" "}
                <button
                  type="button"
                  onClick={() => setShowTerminosModal(true)}
                  className="text-terracotta font-bold underline hover:text-terracotta-deep focus:outline-none"
                >
                  Términos y Condiciones de Reserva y Estadía
                </button>{" "}
                de la Pensión Señora Myriam. *
              </span>
            </label>
          </div>

          {/* SELECCIÓN DE MÉTODO DE PAGO */}
          <div className="space-y-4 pt-4 border-t border-sand-border/30">
            <span className="font-bold text-ink text-sm block">💳 Método de Pago</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setMetodoPago("DEBITO")}
                className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 flex flex-col justify-between ${
                  metodoPago === "DEBITO"
                    ? "border-terracotta bg-card shadow-xs ring-2 ring-terracotta/20 font-bold"
                    : "border-sand-border bg-white hover:border-terracotta/40 font-medium"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm">💳 Débito</span>
                  <span className="text-[9px] uppercase tracking-wider bg-orange-100 text-orange-950 px-2 py-0.5 rounded-full font-bold">Webpay</span>
                </div>
                <p className="text-muted text-[10px] leading-relaxed">
                  Pago instantáneo con Redcompra. Conexión segura con Transbank.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("CREDITO")}
                className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 flex flex-col justify-between ${
                  metodoPago === "CREDITO"
                    ? "border-terracotta bg-card shadow-xs ring-2 ring-terracotta/20 font-bold"
                    : "border-sand-border bg-white hover:border-terracotta/40 font-medium"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm">💳 Crédito</span>
                  <span className="text-[9px] uppercase tracking-wider bg-orange-100 text-orange-950 px-2 py-0.5 rounded-full font-bold">Webpay</span>
                </div>
                <p className="text-muted text-[10px] leading-relaxed">
                  Pago en cuotas. Conexión segura encriptada Webpay Plus.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMetodoPago("TRANSFERENCIA")}
                className={`p-4 rounded-2xl border-2 text-left transition-all space-y-2 flex flex-col justify-between ${
                  metodoPago === "TRANSFERENCIA"
                    ? "border-terracotta bg-card shadow-xs ring-2 ring-terracotta/20 font-bold"
                    : "border-sand-border bg-white hover:border-terracotta/40 font-medium"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-sm">🏦 Transferencia</span>
                  <span className="text-[9px] uppercase tracking-wider bg-sand-deep text-ink px-2 py-0.5 rounded-full font-bold">Manual</span>
                </div>
                <p className="text-muted text-[10px] leading-relaxed">
                  BancoEstado Cuenta RUT. Confirma subiendo tu comprobante.
                </p>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPaso(1)}
              className="w-1/3 bg-sand-deep hover:bg-sand-border text-ink font-semibold py-3.5 rounded-full text-xs"
            >
              ❮ Volver
            </button>
            <button
              type="submit"
              disabled={isLoading || !aceptaTerminos}
              className={`w-2/3 font-semibold py-3.5 rounded-full shadow-lg text-xs sm:text-sm transition-all ${
                aceptaTerminos && !isLoading
                  ? "bg-terracotta hover:bg-terracotta-deep text-white hover:-translate-y-0.5"
                  : "bg-stone-300 text-stone-500 cursor-not-allowed shadow-none"
              }`}
            >
              {isLoading ? "Procesando Reserva..." : "✨ Confirmar y Enviar Reserva"}
            </button>
          </div>
        </form>
      )}

      {/* PASO 3: CONFIRMACIÓN Y CÓDIGO DE RESERVA */}
      {paso === 3 && reservaResultado && (
        <div className="max-w-xl mx-auto bg-card border border-sand-border rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white grid place-items-center font-bold text-3xl shadow-lg mx-auto">
            ✓
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase font-bold text-terracotta tracking-widest">
              ¡Reserva Registrada Exitosamente!
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink">
              Tu Código de Reserva Único
            </h2>
            <p className="text-muted text-xs sm:text-sm">
              Guarda este código para consultar el estado de tu estadía y elegir tu menú del día.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2">
            <div className="font-mono font-bold text-2xl sm:text-3xl text-terracotta">
              {reservaResultado.codigoReserva || `RES-${reservaResultado.id.slice(0, 8)}`}
            </div>

            <button
              type="button"
              onClick={() => handleCopiarCodigo(reservaResultado.codigoReserva || `RES-${reservaResultado.id.slice(0, 8)}`)}
              className="text-xs font-semibold text-terracotta hover:underline"
            >
              {copiedCode ? "✓ ¡Código Copiado!" : "📋 Copiar Código al Portapapeles"}
            </button>
          </div>

          {/* INFORMACIÓN DE PAGO EN LA VISTA DE ÉXITO */}
          {reservaResultado.estadoPago === "PAGADO" ? (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-300 text-emerald-950 text-xs text-left space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <span>✅ PAGO TRANSBANK APROBADO</span>
              </div>
              <p>Monto de {formatCLP(reservaResultado.montoPagado)} cobrado exitosamente vía {reservaResultado.metodoPago === "DEBITO" ? "Tarjeta de Débito" : "Tarjeta de Crédito"} (Webpay Plus).</p>
              <p className="text-[10px] text-emerald-600">Código de Autorización: {Math.floor(100000 + Math.random() * 900000)} · Transbank S.A.</p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-amber-50/30 border border-amber-300 text-ink text-xs text-left space-y-3">
              <div className="font-serif font-bold text-sm text-terracotta border-b border-sand-border/40 pb-2">
                🏦 Coordenadas para Transferencia Bancaria
              </div>
              <div className="space-y-1 sm:grid sm:grid-cols-2 sm:gap-2 sm:space-y-0">
                <div><span className="text-muted">Destinatario:</span> <strong className="text-ink">Myriam Contreras</strong></div>
                <div><span className="text-muted">RUT:</span> <strong className="text-ink">9.876.543-2</strong></div>
                <div><span className="text-muted">Banco:</span> <strong className="text-ink">BancoEstado</strong></div>
                <div><span className="text-muted">Cuenta RUT:</span> <strong className="text-ink">9876543</strong></div>
                <div><span className="text-muted">Tipo Cuenta:</span> <strong className="text-ink">Cuenta Vista / Cuenta RUT</strong></div>
                <div><span className="text-muted">Correo:</span> <strong className="text-ink">pensionmyriam@gmail.com</strong></div>
              </div>
              <div className="pt-2 border-t border-sand-border/30 flex justify-between items-center">
                <span>Total a Transferir:</span>
                <strong className="text-terracotta font-serif text-sm font-black">{formatCLP(reservaResultado.montoPagado)}</strong>
              </div>
              <p className="text-[10px] text-muted italic">Por favor, una vez realizada la transferencia, envía el comprobante de pago a la Señora Myriam por WhatsApp para agilizar la confirmación.</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDescargarPDF}
              className="flex-1 bg-terracotta hover:bg-terracotta-deep text-white font-semibold py-3.5 rounded-full shadow-md text-xs"
            >
              📄 Descargar Comprobante PDF
            </button>
            <a
              href="/mi-reserva"
              className="flex-1 bg-sand-deep hover:bg-sand-border text-ink font-semibold py-3.5 rounded-full border border-sand-border text-xs flex items-center justify-center"
            >
              🔑 Ir al Portal del Huésped
            </a>
          </div>
        </div>
      )}
      {/* MODAL DE GALERÍA DE FOTOS DE HABITACIÓN */}
      {galleryHabitacionId && (() => {
        const hab = habitaciones.find((r) => r.id === galleryHabitacionId);
        if (!hab) return null;
        const detalles = getHabitacionDetalles(hab.numero);

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <div className="bg-card border border-sand-border rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl space-y-4 relative scrollbar-thin">
              <button 
                type="button" 
                onClick={() => setGalleryHabitacionId(null)}
                className="absolute top-4 right-4 text-ink hover:text-terracotta text-2xl font-bold bg-sand-deep/40 w-10 h-10 rounded-full grid place-items-center transition-colors z-10"
              >
                ✕
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7a6f5a]">{hab.numero}</span>
                <h3 className="font-serif font-bold text-ink text-xl sm:text-2xl">{detalles.nombre}</h3>
                <p className="text-muted text-xs">{detalles.capacidadDetalle} · {formatCLP(hab.precioBase)} por noche</p>
              </div>

              {/* Grid de Fotos de la Galería Responsivo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 pt-2">
                {detalles.fotos.map((foto, index) => (
                  <div key={index} className="relative h-24 xs:h-32 sm:h-44 rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-[#ddd0b3]/40 group bg-sand-deep/20">
                    <Image 
                      src={foto} 
                      alt={`Foto ${index + 1} de ${detalles.nombre}`} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>

              {/* Equipamiento Completo */}
              <div className="pt-2">
                <span className="text-xs font-bold text-ink block mb-2">Comodidades de la Pieza:</span>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {detalles.equipamiento.map((eq, i) => (
                    <span key={i} className="bg-sand-deep/50 text-ink px-3 py-1.5 rounded-lg font-bold border border-sand-border">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-sand-border/50 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedHabitacionId(hab.id);
                    setGalleryHabitacionId(null);
                  }}
                  className="bg-terracotta hover:bg-terracotta-deep text-white font-bold px-6 py-3 rounded-full text-xs shadow-md transition-all active:scale-95"
                >
                  ✨ Seleccionar esta Habitación
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL DE TÉRMINOS Y CONDICIONES (Para lectura rápida en reserva) */}
      {showTerminosModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-sand-border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col justify-between">
            <button 
              type="button" 
              onClick={() => setShowTerminosModal(false)}
              className="absolute top-4 right-4 text-ink hover:text-terracotta text-2xl font-bold bg-sand-deep/40 w-10 h-10 rounded-full grid place-items-center transition-colors z-10"
            >
              ✕
            </button>

            <div className="border-b border-sand-border/50 pb-3 pr-8">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-terracotta">Documento Oficial</span>
              <h3 className="font-serif font-bold text-ink text-xl sm:text-2xl">Términos y Condiciones</h3>
              <p className="text-muted text-xs">Pensión Señora Myriam · Caleta Paposo</p>
            </div>

            {/* Contenido con scroll interno */}
            <div className="overflow-y-auto pr-2 space-y-4 text-xs leading-relaxed text-ink/80 flex-1 scrollbar-thin max-h-[58vh]">
              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">1. Objeto del servicio</h4>
                <p>La Pensión Señora Myriam ofrece servicios de hospedaje en piezas privadas e independientes, así como alimentación casera (desayunos, almuerzos, cenas y colaciones para faena).</p>
                <p>El sistema web de reservas permite a los clientes solicitar estadías, asociar servicios de alimentación y consultar el estado de sus reservas en línea, sin reemplazar la atención directa de la Sra. Myriam.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">2. Uso del sistema de reservas</h4>
                <p><strong>2.1.</strong> El sistema permite visualizar disponibilidad aproximada, registrar solicitudes, asociar alimentación, descargar comprobantes PDF y consultar estados.</p>
                <p><strong>2.2.</strong> La confirmación definitiva se realiza cuando la Sra. Myriam valida la solicitud. Hasta ese momento, la reserva figura como "Pendiente".</p>
                <p><strong>2.3.</strong> En caso de discrepancias imprevistas de disponibilidad en el sistema, prevalecerá la confirmación final de la administración.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">3. Código de reserva y portal del huésped</h4>
                <p><strong>3.1.</strong> Cada reserva confirmada cuenta con un código único de reserva en formato RES-AAAA-XXXXXX.</p>
                <p><strong>3.2.</strong> Permite consultar estadía, ver el menú diario, enviar solicitudes de cambio y descargar PDFs.</p>
                <p><strong>3.3.</strong> El cliente debe custodiar sus claves de acceso al portal y no compartirlas.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">4. Cambios y cancelaciones de reserva</h4>
                <p><strong>4.1.</strong> Cambios de fechas permitidos hasta 24 horas antes del check-in. Cambios posteriores se coordinan por teléfono sujetos a disponibilidad.</p>
                <p><strong>4.2.</strong> Cancelaciones con al menos 24 horas previas no tienen penalidad. Cancelaciones posteriores implican cobros parciales/totales de la primera noche.</p>
                <p><strong>4.3.</strong> En caso de no presentarse sin previo aviso (No Show), la pieza se liberará y se aplicarán cobros.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">5. Gestión de alimentación casera</h4>
                <p><strong>5.1.</strong> El menú del día es fijado por la Sra. Myriam sujeto a disponibilidad de insumos en la Caleta.</p>
                <p><strong>5.2.</strong> Modificaciones o renuncias voluntarias a platos deben registrarse con al menos 4 horas de anticipación.</p>
                <p><strong>5.3.</strong> Por naturaleza local, el plato puede variar, ofreciendo siempre una alternativa idéntica.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">6. Responsabilidades del cliente</h4>
                <p>El cliente se obliga a aportar información real, respetar horarios de check-in/out, avisar oportunamente la inasistencia a comidas, y cuidar con esmero las instalaciones de la pensión.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">7. Responsabilidades de la Pensión</h4>
                <p>Garantizar higiene, servir alimentos en horarios estipulados y asistir de buena fe ante imprevistos de fuerza mayor (cortes de suministro en la zona rural o problemas climáticos).</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">8. Limitación de responsabilidad web</h4>
                <p>El sistema web es un apoyo de gestión. No garantiza conexión perpetua (conectividad local inestable). En caso de corte, prevalecerá la atención telefónica.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">9. Tratamiento de datos personales</h4>
                <p>Los datos se usan únicamente para control interno de hospedaje y generación de facturas. No se venden ni difunden con externos.</p>
              </section>

              <section className="space-y-1">
                <h4 className="font-serif font-bold text-ink text-sm">10. Aceptación de los Términos</h4>
                <p>El registro de la solicitud o confirmación de reserva implica la lectura integral y aceptación explícita de estos términos.</p>
              </section>
            </div>

            <div className="pt-4 border-t border-sand-border/50 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAceptaTerminos(true);
                  setShowTerminosModal(false);
                }}
                className="flex-1 bg-[#1EAD50] hover:bg-emerald-700 text-white font-bold py-3.5 rounded-full text-xs transition-all text-center shadow-md active:scale-95"
              >
                ✓ Entendido y Aceptar
              </button>
              <button
                type="button"
                onClick={() => setShowTerminosModal(false)}
                className="w-1/3 bg-sand-deep hover:bg-sand-border text-ink font-bold py-3.5 rounded-full text-xs transition-all text-center"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORMULARIO DE INGRESO DE TARJETA CON ANIMACIÓN 3D FLIP */}
      {showCardForm && (
        <div className="fixed inset-0 z-50 bg-[#1E1B16]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD0B3] rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl flex flex-col md:flex-row gap-8 items-center text-ink relative animate-scale-in">
            <button 
              type="button" 
              onClick={() => setShowCardForm(false)}
              className="absolute top-4 right-4 text-ink hover:text-terracotta text-2xl font-bold bg-sand-deep/40 w-10 h-10 rounded-full grid place-items-center transition-colors z-10"
            >
              ✕
            </button>

            {/* PARTE IZQUIERDA: FORMULARIO */}
            <form onSubmit={handlePagarConTarjeta} className="w-full md:w-1/2 space-y-4 order-2 md:order-1 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-terracotta">Paso Final</span>
                <h3 className="font-serif font-black text-lg text-ink">Datos de tu Tarjeta</h3>
                <p className="text-muted text-[11px]">Ingresa los datos para simular el pago en Webpay.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-muted font-bold mb-1">Número de Tarjeta *</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumero}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setCardNumero(formatted.slice(0, 19));
                    }}
                    placeholder="4557 1234 5678 9012"
                    className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-muted font-bold mb-1">Nombre del Titular *</label>
                  <input
                    type="text"
                    required
                    value={cardNombre}
                    onChange={(e) => setCardNombre(e.target.value.toUpperCase())}
                    placeholder="JUAN PEREZ SANCHEZ"
                    className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none text-xs font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted font-bold mb-1">Expiración *</label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={cardExpiracion}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2) {
                          val = val.slice(0, 2) + "/" + val.slice(2, 4);
                        }
                        setCardExpiracion(val);
                      }}
                      placeholder="MM/AA"
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none text-xs font-semibold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-muted font-bold mb-1">CVV *</label>
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      onFocus={() => setIsCardBack(true)}
                      onBlur={() => setIsCardBack(false)}
                      placeholder="123"
                      className="w-full p-3 rounded-xl border border-sand-border bg-white text-ink outline-none text-xs font-semibold text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCardForm(false)}
                  className="w-1/3 bg-sand-deep hover:bg-sand-border text-ink font-semibold py-3.5 rounded-full text-xs"
                >
                  ❮ Atrás
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-terracotta hover:bg-terracotta-deep text-white font-bold py-3.5 rounded-full shadow-lg hover:-translate-y-0.5 transition-all text-xs"
                >
                  💳 Pagar {formatCLP(totalGeneral)}
                </button>
              </div>
            </form>

            {/* PARTE DERECHA: TARJETA 3D INTERACTIVA */}
            <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 order-1 md:order-2 border-b md:border-b-0 md:border-l border-[#F0EAE1] pb-6 md:pb-0">
              <div 
                className="w-72 h-44 cursor-pointer"
                style={{ perspective: "1000px" }}
                onClick={() => setIsCardBack(!isCardBack)}
              >
                <div 
                  className="w-full h-full relative transition-transform duration-700 ease-out"
                  style={{ 
                    transformStyle: "preserve-3d",
                    transform: isCardBack ? "rotateY(180deg)" : "rotateY(0deg)"
                  }}
                >
                  {/* FRENTE DE LA TARJETA */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-2xl p-5 text-white font-mono flex flex-col justify-between shadow-2xl overflow-hidden"
                    style={{ 
                      backfaceVisibility: "hidden",
                      background: "linear-gradient(135deg, #1E1B16 0%, #2D271E 50%, #15120E 100%)",
                      border: "1px solid rgba(221,208,179,0.2)"
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform -rotate-45 pointer-events-none"></div>
                    
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="w-9 h-7 rounded-md bg-[#D9583B]/85 flex items-center justify-center text-[8px] font-bold tracking-widest text-white border border-[#DDD0B3]/30">
                          Myriam
                        </div>
                        <div className="w-7 h-5 rounded-md bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-100 border border-yellow-600 flex flex-col justify-around p-0.5">
                          <div className="h-[0.5px] bg-yellow-800/40"></div>
                          <div className="h-[0.5px] bg-yellow-800/40"></div>
                          <div className="h-[0.5px] bg-yellow-800/40"></div>
                        </div>
                      </div>
                      
                      <span className="text-[8px] uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded font-extrabold text-[#DDD0B3]">
                        {metodoPago === "DEBITO" ? "DÉBITO" : "CRÉDITO"}
                      </span>
                    </div>

                    <div className="text-sm sm:text-base tracking-widest text-center py-2 font-bold font-mono text-stone-100">
                      {cardNumero || "•••• •••• •••• ••••"}
                    </div>

                    <div className="flex justify-between items-end text-[9px]">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="text-stone-400 text-[7px] uppercase block">Titular</span>
                        <span className="font-bold truncate block text-stone-200">{cardNombre || "NOMBRE TITULAR"}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-stone-400 text-[7px] uppercase block">Expira</span>
                        <span className="font-bold text-stone-200">{cardExpiracion || "MM/AA"}</span>
                      </div>
                    </div>
                  </div>

                  {/* REVERSO DE LA TARJETA */}
                  <div 
                    className="absolute inset-0 w-full h-full rounded-2xl py-4 text-white font-mono flex flex-col justify-between shadow-2xl overflow-hidden"
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      background: "linear-gradient(135deg, #15120E 0%, #201C15 50%, #090806 100%)",
                      border: "1px solid rgba(221,208,179,0.2)"
                    }}
                  >
                    <div className="w-full h-8 bg-black mt-1"></div>

                    <div className="px-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-36 h-6 bg-stone-200/90 rounded text-stone-900 text-[8px] px-2 flex items-center font-serif italic font-bold">
                          {cardNombre || "Firma del Titular"}
                        </div>
                        <div className="w-10 h-6 bg-white text-stone-950 font-bold font-mono text-xs text-center flex items-center justify-center rounded border-2 border-orange-400">
                          {cardCvv || "•••"}
                        </div>
                      </div>
                      
                      <div className="text-[6px] text-stone-400 leading-normal">
                        Esta tarjeta es de uso exclusivo de la pasarela simulada Webpay Plus. Válida únicamente en el Prototipo de la Pensión Señora Myriam.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-muted text-[10px] mt-4 flex items-center gap-1">
                <span>🔄</span> Toca la tarjeta o escribe en el CVV para ver el volteo 3D.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SIMULADOR DE PASARELA DE PAGO WEBPAY PLUS */}
      {isPaying && (
        <div className="fixed inset-0 z-50 bg-[#1E1B16]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-[#DDD0B3] rounded-3xl p-8 max-w-sm w-full shadow-2xl space-y-6 text-center text-ink animate-scale-in">
            {/* Cabecera Webpay Plus Simulada */}
            <div className="flex flex-col items-center space-y-2 border-b border-[#F0EAE1] pb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-950 rounded-full text-[10px] font-black tracking-widest uppercase">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
                Transbank Webpay Plus
              </div>
              <h3 className="font-serif font-black text-xl text-[#2A2418]">Simulador de Pago</h3>
              <p className="text-muted text-[10px] uppercase tracking-wider font-semibold">Comercio: Pensión Señora Myriam</p>
            </div>

            {/* Cuerpo del Procesamiento */}
            <div className="space-y-5 py-2 flex flex-col items-center">
              {payStep !== "EXITOSO" ? (
                /* Spinner Giratorio */
                <div className="w-14 h-14 border-4 border-sand-border border-t-terracotta rounded-full animate-spin"></div>
              ) : (
                /* Éxito */
                <div className="w-14 h-14 bg-emerald-100 text-emerald-700 border-2 border-emerald-300 rounded-full grid place-items-center text-2xl font-bold animate-bounce shadow-xs">
                  ✓
                </div>
              )}

              <div className="space-y-1">
                <p className="font-serif font-bold text-sm text-[#2A2418]">
                  {payStep === "CONECTANDO" && "Estableciendo conexión segura..."}
                  {payStep === "VERIFICANDO" && "Autenticando tarjeta bancaria..."}
                  {payStep === "PROCESANDO" && `Procesando cobro en Webpay...`}
                  {payStep === "EXITOSO" && "¡Pago aprobado con éxito! 🎉"}
                </p>
                <p className="text-[#7A6F5A] text-[11px] font-normal leading-relaxed max-w-xs">
                  {payStep === "CONECTANDO" && "Conectando con los servidores seguros de Transbank encriptación SSL..."}
                  {payStep === "VERIFICANDO" && "Validando credenciales de emisor bancario y cupo disponible..."}
                  {payStep === "PROCESANDO" && `Cargando el monto total de ${formatCLP(totalGeneral)}...`}
                  {payStep === "EXITOSO" && "Transacción autorizada. Redireccionando al portal de reserva de la pensión..."}
                </p>
              </div>
            </div>

            {/* Pie del modal simulado */}
            <div className="bg-sand-deep/30 p-3 rounded-2xl border border-sand-border flex justify-between items-center text-xs">
              <span className="text-muted">Total a Pagar:</span>
              <strong className="text-terracotta font-serif text-sm font-black">{formatCLP(totalGeneral)}</strong>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SIN CONEXIÓN - PLAN B (WHATSAPP / SMS) */}
      {showOfflineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border-2 border-sand-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center text-ink animate-scale-in">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 border-2 border-amber-300 grid place-items-center font-bold text-2xl mx-auto">
              ⚠️
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-xl text-ink">Sin conexión a Internet</h3>
              <p className="text-muted text-xs sm:text-sm leading-relaxed">
                No pudimos conectar con el servidor para registrar tu reserva en este momento.
              </p>
              <div className="text-ink/90 text-xs font-semibold bg-sand-deep/30 p-4 rounded-2xl border border-sand-border/40 text-left space-y-1 leading-relaxed">
                <span className="block font-bold text-center border-b border-sand-border pb-1 mb-1">Resumen de tu solicitud:</span>
                <div>Huésped: {nombre}</div>
                <div>Fono: {telefono}</div>
                <div>Fechas: {checkInDate.toISOString().split("T")[0]} al {checkOutDate.toISOString().split("T")[0]}</div>
                <div>Pieza: {habitacionSel?.numero}</div>
                <div>Total: {formatCLP(totalGeneral)}</div>
              </div>
              <p className="text-xs text-muted">
                Para asegurar tu estadía en Paposo, puedes enviar esta solicitud pre-formateada por WhatsApp o SMS (los cuales operan con niveles de señal muy bajos).
              </p>
            </div>
            
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleSendOfflineBackup("whatsapp")}
                className="w-full bg-[#1EAD50] hover:bg-[#158C3D] text-white font-bold py-3.5 rounded-full shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>💬 Enviar por WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleSendOfflineBackup("sms")}
                className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-bold py-3.5 rounded-full shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>📱 Enviar por SMS Tradicional</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowOfflineModal(false)}
                className="w-full bg-sand-deep hover:bg-sand-border text-ink font-semibold py-3 rounded-full text-xs transition-all cursor-pointer"
              >
                Cancelar y reintentar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
