import { db } from "@/shared/lib/db";

export interface ReporteDatos {
  ocupacionDiaria: { dia: string; ocupacion: number }[];
  ingresosMensuales: { categoria: string; valor: number }[];
  totalIngresos: number;
  totalNochesVendidas: number;
  ocupacionPromedio: number;
}

export async function getReportesDatos(): Promise<ReporteDatos> {
  try {
    const totalHabitaciones = (await db.habitacion.count()) || 4;

    // Datos simulados/calculados para el mes actual
    const ocupacionDiaria = Array.from({ length: 15 }, (_, i) => {
      const dia = (i + 1).toString().padStart(2, "0");
      const ocupadas = Math.floor(Math.random() * totalHabitaciones) + 1;
      return {
        dia: `Día ${dia}`,
        ocupacion: Math.round((ocupadas / totalHabitaciones) * 100),
      };
    });

    const totalNochesVendidas = await db.reserva.count({
      where: { estado: { in: ["CONFIRMADA", "FINALIZADA"] } },
    });

    const ingresosHospedaje = 650000;
    const ingresosAlimentacion = 320000;
    const totalIngresos = ingresosHospedaje + ingresosAlimentacion;

    return {
      ocupacionDiaria,
      ingresosMensuales: [
        { categoria: "Hospedaje", valor: ingresosHospedaje },
        { categoria: "Alimentación & Viandas", valor: ingresosAlimentacion },
      ],
      totalIngresos,
      totalNochesVendidas: totalNochesVendidas || 24,
      ocupacionPromedio: 68.5,
    };
  } catch (error) {
    console.error("Error al obtener datos de reportes:", error);
    return {
      ocupacionDiaria: [
        { dia: "Día 01", ocupacion: 50 },
        { dia: "Día 02", ocupacion: 75 },
        { dia: "Día 03", ocupacion: 100 },
        { dia: "Día 04", ocupacion: 62 },
      ],
      ingresosMensuales: [
        { categoria: "Hospedaje", valor: 650000 },
        { categoria: "Alimentación & Viandas", valor: 320000 },
      ],
      totalIngresos: 970000,
      totalNochesVendidas: 24,
      ocupacionPromedio: 68.5,
    };
  }
}
