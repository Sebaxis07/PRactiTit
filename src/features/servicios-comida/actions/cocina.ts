"use server";

import { db } from "@/shared/lib/db";
import { revalidatePath } from "next/cache";

export async function guardarMenuDiario(data: {
  fechaStr: string;
  horarioDesayuno?: string;
  horarioAlmuerzo?: string;
  horarioCena?: string;
  desayunoTexto?: string;
  desayunoImagen?: string;
  desayunoDisponible?: boolean;
  almuerzoOpcion1?: string;
  almuerzoOpcion1Imagen?: string;
  almuerzoOpcion1Disponible?: boolean;
  almuerzoOpcion2?: string;
  almuerzoOpcion2Imagen?: string;
  almuerzoOpcion2Disponible?: boolean;
  cenaOpcion1?: string;
  cenaOpcion1Imagen?: string;
  cenaOpcion1Disponible?: boolean;
  cenaOpcion2?: string;
  cenaOpcion2Imagen?: string;
  cenaOpcion2Disponible?: boolean;
  colacionTexto?: string;
  colacionImagen?: string;
  colacionDisponible?: boolean;
}) {
  try {
    const fecha = new Date(data.fechaStr);
    fecha.setHours(0, 0, 0, 0);

    const payload = {
      horarioDesayuno: data.horarioDesayuno || "08:00 - 09:30",
      horarioAlmuerzo: data.horarioAlmuerzo || "13:00 - 15:00",
      horarioCena: data.horarioCena || "20:00 - 21:30",
      desayunoTexto: data.desayunoTexto,
      desayunoImagen: data.desayunoImagen,
      desayunoDisponible: data.desayunoDisponible ?? true,
      almuerzoOpcion1: data.almuerzoOpcion1,
      almuerzoOpcion1Imagen: data.almuerzoOpcion1Imagen,
      almuerzoOpcion1Disponible: data.almuerzoOpcion1Disponible ?? true,
      almuerzoOpcion2: data.almuerzoOpcion2,
      almuerzoOpcion2Imagen: data.almuerzoOpcion2Imagen,
      almuerzoOpcion2Disponible: data.almuerzoOpcion2Disponible ?? true,
      cenaOpcion1: data.cenaOpcion1,
      cenaOpcion1Imagen: data.cenaOpcion1Imagen,
      cenaOpcion1Disponible: data.cenaOpcion1Disponible ?? true,
      cenaOpcion2: data.cenaOpcion2,
      cenaOpcion2Imagen: data.cenaOpcion2Imagen,
      cenaOpcion2Disponible: data.cenaOpcion2Disponible ?? true,
      colacionTexto: data.colacionTexto,
      colacionImagen: data.colacionImagen,
      colacionDisponible: data.colacionDisponible ?? true,
    };

    const existing = await db.menuDiario.findFirst({
      where: { fecha },
    });

    if (existing) {
      await db.menuDiario.update({
        where: { id: existing.id },
        data: payload,
      });
    } else {
      await db.menuDiario.create({
        data: {
          fecha,
          ...payload,
        },
      });
    }

    revalidatePath("/admin/cocina");
    revalidatePath("/mi-reserva");
    return { success: true };
  } catch (error: any) {
    console.error("Error al guardar menú diario:", error);
    return { success: false, error: error.message };
  }
}

export async function duplicarMenuParaMananaAction(fechaBaseStr: string) {
  try {
    const fechaBase = new Date(fechaBaseStr);
    fechaBase.setHours(0, 0, 0, 0);

    const fechaManana = new Date(fechaBase);
    fechaManana.setDate(fechaManana.getDate() + 1);

    const menuBase = await db.menuDiario.findFirst({
      where: { fecha: fechaBase },
    });

    if (!menuBase) {
      return { success: false, error: "No existe menú registrado hoy para duplicar." };
    }

    const existingManana = await db.menuDiario.findFirst({
      where: { fecha: fechaManana },
    });

    const dataCopy = {
      horarioDesayuno: menuBase.horarioDesayuno,
      horarioAlmuerzo: menuBase.horarioAlmuerzo,
      horarioCena: menuBase.horarioCena,
      desayunoTexto: menuBase.desayunoTexto,
      desayunoImagen: menuBase.desayunoImagen,
      desayunoDisponible: menuBase.desayunoDisponible,
      almuerzoOpcion1: menuBase.almuerzoOpcion1,
      almuerzoOpcion1Imagen: menuBase.almuerzoOpcion1Imagen,
      almuerzoOpcion1Disponible: menuBase.almuerzoOpcion1Disponible,
      almuerzoOpcion2: menuBase.almuerzoOpcion2,
      almuerzoOpcion2Imagen: menuBase.almuerzoOpcion2Imagen,
      almuerzoOpcion2Disponible: menuBase.almuerzoOpcion2Disponible,
      cenaOpcion1: menuBase.cenaOpcion1,
      cenaOpcion1Imagen: menuBase.cenaOpcion1Imagen,
      cenaOpcion1Disponible: menuBase.cenaOpcion1Disponible,
      cenaOpcion2: menuBase.cenaOpcion2,
      cenaOpcion2Imagen: menuBase.cenaOpcion2Imagen,
      cenaOpcion2Disponible: menuBase.cenaOpcion2Disponible,
      colacionTexto: menuBase.colacionTexto,
      colacionImagen: menuBase.colacionImagen,
      colacionDisponible: menuBase.colacionDisponible,
    };

    if (existingManana) {
      await db.menuDiario.update({
        where: { id: existingManana.id },
        data: dataCopy,
      });
    } else {
      await db.menuDiario.create({
        data: {
          fecha: fechaManana,
          ...dataCopy,
        },
      });
    }

    revalidatePath("/admin/cocina");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleDisponibilidadPlatoAction(fechaStr: string, campo: string, estado: boolean) {
  try {
    const fecha = new Date(fechaStr);
    fecha.setHours(0, 0, 0, 0);

    const existing = await db.menuDiario.findFirst({
      where: { fecha },
    });

    if (!existing) return { success: false, error: "Menú no encontrado" };

    await db.menuDiario.update({
      where: { id: existing.id },
      data: {
        [campo]: estado,
      },
    });

    revalidatePath("/admin/cocina");
    revalidatePath("/mi-reserva");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getMenuDiario(fechaStr: string) {
  try {
    const fecha = new Date(fechaStr);
    fecha.setHours(0, 0, 0, 0);

    const menu = await db.menuDiario.findFirst({
      where: { fecha },
    });

    return menu;
  } catch (error) {
    return null;
  }
}

// ACCIONES LADO CLIENTE (/mi-reserva)
export async function guardarPreferenciaPlatoAction(reservaId: string, servicioId: string, servicio: "almuerzo" | "cena", preferencia: string) {
  try {
    const field = servicio === "almuerzo" ? "preferenciaAlmuerzo" : "preferenciaCena";
    await db.reservaServicio.update({
      where: { id: servicioId },
      data: {
        [field]: preferencia,
      },
    });

    revalidatePath("/mi-reserva");
    revalidatePath("/admin/cocina");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function renunciarServicioAction(reservaId: string, servicioId: string, servicio: "desayuno" | "almuerzo" | "cena", renuncia: boolean) {
  try {
    const field = servicio === "desayuno" ? "renunciaDesayuno" : servicio === "almuerzo" ? "renunciaAlmuerzo" : "renunciaCena";
    await db.reservaServicio.update({
      where: { id: servicioId },
      data: {
        [field]: renuncia,
      },
    });

    revalidatePath("/mi-reserva");
    revalidatePath("/admin/cocina");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function solicitarServicioExtraAction(reservaId: string, servicioId: string, nota: string) {
  try {
    await db.reservaServicio.update({
      where: { id: servicioId },
      data: {
        solicitudExtraNotas: nota,
      },
    });

    revalidatePath("/mi-reserva");
    revalidatePath("/admin/cocina");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function actualizarEstadoServicioAction(
  servicioId: string,
  tipoServicio: "desayuno" | "colacion" | "cena",
  nuevoEstado: "PENDIENTE" | "EN_PREPARACION" | "SERVIDO" | "NO_SHOW"
) {
  try {
    const field = tipoServicio === "desayuno" ? "estadoDesayuno" : tipoServicio === "colacion" ? "estadoColacion" : "estadoCena";
    await db.reservaServicio.update({
      where: { id: servicioId },
      data: {
        [field]: nuevoEstado,
      },
    });

    revalidatePath("/admin/cocina");
    revalidatePath("/mi-reserva");
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar estado de ración:", error);
    return { success: false, error: error.message };
  }
}

