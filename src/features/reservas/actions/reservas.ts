"use server";

import { db } from "@/shared/lib/db";
import { revalidatePath } from "next/cache";

export interface CrearReservaInput {
  nombre: string;
  telefono: string;
  rut?: string;
  tipo: "TRABAJADOR_FAENA" | "TURISTA";
  empresa?: string;
  habitacionId: string;
  fechaCheckIn: string;
  fechaCheckOut: string;
  servicios?: {
    fechaServicio: string;
    desayunosCant: number;
    colacionesCant: number;
    cenasCant: number;
    restriccionDietaria?: string;
  }[];
  metodoPago?: string;
  estadoPago?: string;
  montoPagado?: number;
}

export async function crearSolicitudReserva(data: CrearReservaInput) {
  try {
    // 1. Generar Código Único de Reserva (ej. RES-2026-041892)
    const randomCodeNumber = Math.floor(100000 + Math.random() * 900000);
    const codigoReserva = `RES-2026-${randomCodeNumber}`;

    // 2. Buscar o crear cliente
    let cliente = await db.cliente.findFirst({
      where: {
        OR: [
          { telefono: data.telefono },
          { rutPasaporte: data.rut && data.rut !== "" ? data.rut : undefined },
        ],
      },
    });

    if (!cliente) {
      cliente = await db.cliente.create({
        data: {
          nombre: data.nombre,
          telefono: data.telefono,
          rutPasaporte: data.rut,
          tipo: data.tipo,
          empresa: data.empresa,
        },
      });
    }

    // 3. Crear Reserva en Supabase Postgres
    const dataToCreate: any = {
      codigoReserva,
      clienteId: cliente.id,
      habitacionId: data.habitacionId,
      fechaCheckIn: new Date(data.fechaCheckIn),
      fechaCheckOut: new Date(data.fechaCheckOut),
      estado: "PENDIENTE",
      metodoPago: data.metodoPago || "TRANSFERENCIA",
      estadoPago: data.estadoPago || "PENDIENTE",
      montoPagado: data.montoPagado || 0,
    };

    const reserva = await db.reserva.create({
      data: dataToCreate,
      include: {
        habitacion: true,
        cliente: true,
      },
    });

    // 4. Registrar Servicios de Comida
    if (data.servicios && data.servicios.length > 0) {
      for (const serv of data.servicios) {
        await db.reservaServicio.create({
          data: {
            reservaId: reserva.id,
            fechaServicio: new Date(serv.fechaServicio),
            desayunosCant: serv.desayunosCant,
            colacionesCant: serv.colacionesCant,
            cenasCant: serv.cenasCant,
            restriccionDietaria: serv.restriccionDietaria,
          },
        });
      }
    }

    // 5. Formatear mensaje para WhatsApp API
    const fechaInCL = new Date(data.fechaCheckIn).toLocaleDateString("es-CL");
    const fechaOutCL = new Date(data.fechaCheckOut).toLocaleDateString("es-CL");

    const formatMetodo = data.metodoPago === "DEBITO" ? "Tarjeta de Débito" : data.metodoPago === "CREDITO" ? "Tarjeta de Crédito" : "Transferencia Bancaria";
    const formatEstado = data.estadoPago === "PAGADO" ? "PAGADO" : "PENDIENTE DE CONFIRMACIÓN";
    const totalCLPStr = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP" }).format(data.montoPagado || 0);

    const mensajeText = `*NUEVA SOLICITUD DE RESERVA WEB* 🏠\n` +
      `*Código:* ${codigoReserva}\n` +
      `*Huésped:* ${data.nombre}\n` +
      `*Teléfono:* ${data.telefono}\n` +
      `*Tipo:* ${data.tipo === "TRABAJADOR_FAENA" ? "Trabajador de Faena" : "Turista"}\n` +
      (data.empresa ? `*Empresa:* ${data.empresa}\n` : "") +
      `*Habitación:* ${reserva.habitacion.numero}\n` +
      `*Check-in:* ${fechaInCL}\n` +
      `*Check-out:* ${fechaOutCL}\n` +
      `*Pago:* ${totalCLPStr} vía ${formatMetodo} (${formatEstado})\n` +
      `*Estado Reserva:* PENDIENTE DE CONFIRMACIÓN`;

    const whatsAppUrl = `https://wa.me/56940199049?text=${encodeURIComponent(mensajeText)}`;

    revalidatePath("/admin");
    revalidatePath("/admin/reservas");

    return {
      success: true,
      codigoReserva,
      reservaId: reserva.id,
      whatsAppUrl,
    };
  } catch (error: any) {
    console.error("Error al crear solicitud de reserva:", error);
    return {
      success: false,
      error: error.message || "Error al procesar la reserva en la base de datos.",
    };
  }
}

export async function consultarReservaPorCodigo(codigo: string, busquedaContacto: string) {
  const cleanCode = codigo.trim().toUpperCase();
  const cleanContacto = busquedaContacto.trim().toLowerCase();

  try {
    const reserva = await db.reserva.findFirst({
      where: {
        OR: [
          { codigoReserva: cleanCode },
          { id: cleanCode.toLowerCase() },
        ],
      },
      include: {
        cliente: true,
        habitacion: true,
        servicios: true,
      },
    });

    if (!reserva) {
      return { success: false, error: "No se encontró ninguna reserva con el código ingresado." };
    }

    // Validar coincidencia con teléfono o nombre del cliente
    const coincideTel = reserva.cliente?.telefono?.toLowerCase().includes(cleanContacto);
    const coincideNombre = reserva.cliente?.nombre?.toLowerCase().includes(cleanContacto);

    if (!coincideTel && !coincideNombre && cleanContacto.length > 0) {
      return {
        success: false,
        error: "El código de reserva es correcto, pero el teléfono o nombre ingresado no coincide.",
      };
    }

    return { success: true, reserva };
  } catch (error: any) {
    console.error("Error al consultar reserva por código:", error);
    return { success: false, error: error.message };
  }
}

export async function solicitarCambioHuesped(codigo: string, detalleCambio: string) {
  try {
    const reserva = await db.reserva.findFirst({
      where: { codigoReserva: codigo },
    });

    if (!reserva) {
      return { success: false, error: "Reserva no encontrada." };
    }

    await db.reserva.update({
      where: { id: reserva.id },
      data: {
        solicitudCambio: detalleCambio,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/reservas");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getFechasOcupadas() {
  try {
    const reservas = await db.reserva.findMany({
      where: {
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
      select: {
        habitacionId: true,
        fechaCheckIn: true,
        fechaCheckOut: true,
      },
    });
    return reservas.map((r) => ({
      habitacionId: r.habitacionId,
      fechaCheckIn: r.fechaCheckIn.toISOString(),
      fechaCheckOut: r.fechaCheckOut.toISOString(),
    }));
  } catch (error) {
    return [];
  }
}

export async function calificarReserva({
  reservaId,
  estrellas,
  comentario,
  nombreAutor,
}: {
  reservaId: string;
  estrellas: number;
  comentario?: string;
  nombreAutor: string;
}) {
  try {
    // 1. Validar que la reserva exista
    const reserva = await db.reserva.findUnique({
      where: { id: reservaId },
      include: { calificacion: true },
    });

    if (!reserva) {
      return { success: false, error: "No se encontró la reserva especificada." };
    }

    // 2. Validar que no tenga una calificación previa
    if (reserva.calificacion) {
      return { success: false, error: "Esta reserva ya ha sido calificada." };
    }

    // 3. Crear la calificación en la base de datos
    await db.calificacion.create({
      data: {
        reservaId,
        estrellas,
        comentario,
        nombreAutor,
        aprobado: true, // Aprobada por defecto, se puede moderar
      },
    });

    // Revalidar el Home y el Portal del Huésped
    revalidatePath("/");
    revalidatePath("/mi-reserva");

    return { success: true };
  } catch (error: any) {
    console.error("Error al registrar calificación:", error);
    return {
      success: false,
      error: error.message || "Error interno al guardar la calificación en la base de datos.",
    };
  }
}
