import { db } from "@/shared/lib/db";
import { HabitacionDTO } from "../types";

export async function getHabitacionesDisponibles(): Promise<HabitacionDTO[]> {
  try {
    let habitaciones = await db.habitacion.findMany({
      where: {
        estado: {
          not: "MANTENIMIENTO",
        },
      },
      orderBy: {
        numero: "asc",
      },
    });

    // Si la base de datos está vacía, se insertan habitaciones iniciales de muestra
    if (habitaciones.length === 0) {
      await db.habitacion.createMany({
        data: [
          {
            numero: "Pieza 1 — Vista Mar",
            capacidad: 2,
            precioBase: 25000,
            estado: "DISPONIBLE",
          },
          {
            numero: "Pieza 2 — Familiar",
            capacidad: 4,
            precioBase: 40000,
            estado: "DISPONIBLE",
          },
          {
            numero: "Pieza 3 — Ejecutiva Faena",
            capacidad: 1,
            precioBase: 30000,
            estado: "DISPONIBLE",
          },
          {
            numero: "Pieza 4 — Doble Paposo",
            capacidad: 2,
            precioBase: 28000,
            estado: "DISPONIBLE",
          },
        ],
      });

      habitaciones = await db.habitacion.findMany({
        orderBy: { numero: "asc" },
      });
    }

    return habitaciones.map((h) => ({
      id: h.id,
      numero: h.numero,
      capacidad: h.capacidad,
      precioBase: Number(h.precioBase),
      estado: h.estado,
    }));
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    // Retorno de fallback si no hay conexión a base de datos en este momento
    return [
      { id: "h1", numero: "Pieza 1 — Vista Mar", capacidad: 2, precioBase: 25000, estado: "DISPONIBLE" },
      { id: "h2", numero: "Pieza 2 — Familiar", capacidad: 4, precioBase: 40000, estado: "DISPONIBLE" },
      { id: "h3", numero: "Pieza 3 — Ejecutiva Faena", capacidad: 1, precioBase: 30000, estado: "DISPONIBLE" },
    ];
  }
}
