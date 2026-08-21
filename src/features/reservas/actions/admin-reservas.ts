"use server";

import { db } from "@/shared/lib/db";
import { revalidatePath } from "next/cache";

export async function cambiarEstadoReserva(reservaId: string, nuevoEstado: "CONFIRMADA" | "CANCELADA" | "FINALIZADA" | "PENDIENTE") {
  try {
    const reserva = await db.reserva.update({
      where: { id: reservaId },
      data: { estado: nuevoEstado },
      include: { habitacion: true },
    });

    // Actualizar estado de la habitación si se confirma o finaliza
    if (nuevoEstado === "CONFIRMADA") {
      await db.habitacion.update({
        where: { id: reserva.habitacionId },
        data: { estado: "OCUPADA" },
      });
    } else if (nuevoEstado === "FINALIZADA" || nuevoEstado === "CANCELADA") {
      await db.habitacion.update({
        where: { id: reserva.habitacionId },
        data: { estado: "DISPONIBLE" },
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/reservas");
    revalidatePath("/admin/cocina");

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar estado de la reserva:", error);
    return { success: false, error: error.message };
  }
}

export async function bloquearHabitacion(habitacionId: string, motivo: "MANTENIMIENTO" | "LIMPIEZA" | "DISPONIBLE" | "OCUPADA") {
  try {
    const habitacion = await db.habitacion.update({
      where: { id: habitacionId },
      data: { estado: motivo },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/habitaciones");
    revalidatePath("/admin/reservas");

    return { success: true };
  } catch (error: any) {
    console.error("Error al cambiar estado de habitación:", error);
    return { success: false, error: error.message };
  }
}

export async function actualizarHabitacionAction(id: string, data: {
  numero?: string;
  capacidad?: number;
  precioBase?: number;
  estado?: "DISPONIBLE" | "OCUPADA" | "MANTENIMIENTO" | "LIMPIEZA";
}) {
  try {
    await db.habitacion.update({
      where: { id },
      data: {
        ...(data.numero && { numero: data.numero }),
        ...(data.capacidad && { capacidad: data.capacidad }),
        ...(data.precioBase && { precioBase: Number(data.precioBase) }),
        ...(data.estado && { estado: data.estado }),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/habitaciones");
    revalidatePath("/admin/reservas");
    revalidatePath("/reservar");

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar habitación:", error);
    return { success: false, error: error.message };
  }
}

export async function getTodasLasReservas() {
  try {
    const list = await db.reserva.findMany({
      include: {
        cliente: true,
        habitacion: true,
        servicios: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Sanitizar objetos Prisma Decimal y Date para pasar a Client Components
    return list.map((r) => ({
      ...r,
      fechaCheckIn: r.fechaCheckIn.toISOString(),
      fechaCheckOut: r.fechaCheckOut.toISOString(),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      habitacion: r.habitacion ? {
        ...r.habitacion,
        precioBase: Number(r.habitacion.precioBase),
        createdAt: r.habitacion.createdAt.toISOString(),
        updatedAt: r.habitacion.updatedAt.toISOString(),
      } : null,
    }));
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    return [];
  }
}

export async function confirmarPagoReserva(reservaId: string, nuevoEstadoPago: "PAGADO" | "PENDIENTE", metodo: string) {
  try {
    await db.reserva.update({
      where: { id: reservaId },
      data: { 
        estadoPago: nuevoEstadoPago,
        metodoPago: metodo,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/reservas");
    revalidatePath("/admin/reportes");

    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar pago de reserva:", error);
    return { success: false, error: error.message };
  }
}
