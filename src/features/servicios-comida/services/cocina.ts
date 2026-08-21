import { db } from "@/shared/lib/db";

export interface PlanificadorCocinaHoy {
  fecha: Date;
  totales: {
    desayunos: number;
    colaciones: number;
    cenas: number;
  };
  detallesServicios: any[];
}

export async function getPlanificadorCocina(fechaDeseada?: Date): Promise<PlanificadorCocinaHoy> {
  const targetDate = fechaDeseada ? new Date(fechaDeseada) : new Date();

  const start = new Date(targetDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(targetDate);
  end.setHours(23, 59, 59, 999);

  try {
    const servicios = await db.reservaServicio.findMany({
      where: {
        fechaServicio: {
          gte: start,
          lte: end,
        },
        reserva: {
          estado: { in: ["CONFIRMADA", "PENDIENTE"] },
        },
      },
      include: {
        reserva: {
          include: {
            cliente: true,
            habitacion: true,
          },
        },
      },
      orderBy: {
        reserva: {
          cliente: {
            nombre: "asc",
          },
        },
      },
    });

    // Descontar renuncias notificados por los huéspedes
    const desayunos = servicios.reduce((acc: number, curr) => (curr.renunciaDesayuno ? acc : acc + curr.desayunosCant), 0);
    const colaciones = servicios.reduce((acc: number, curr) => acc + curr.colacionesCant, 0);
    const cenas = servicios.reduce((acc: number, curr) => (curr.renunciaCena ? acc : acc + curr.cenasCant), 0);

    return {
      fecha: targetDate,
      totales: { desayunos, colaciones, cenas },
      detallesServicios: servicios,
    };
  } catch (error) {
    console.error("Error al obtener planificador de cocina:", error);
    return {
      fecha: targetDate,
      totales: { desayunos: 0, colaciones: 0, cenas: 0 },
      detallesServicios: [],
    };
  }
}
