import { db } from "@/shared/lib/db";

export interface DashboardKPIs {
  habitacionesOcupadasHoy: number;
  totalHabitaciones: number;
  porcentajeOcupacion: number;
  checkInsHoyCount: number;
  checkOutsHoyCount: number;
  solicitudesPendientesCount: number;
  racionesHoy: {
    desayunos: number;
    almuerzos: number;
    cenas: number;
    colaciones: number;
  };
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    const [totalHabitaciones, reservasOcupadasHoy, checkInsHoyCount, checkOutsHoyCount, solicitudesPendientesCount, serviciosHoy] = await Promise.all([
      db.habitacion.count(),
      db.reserva.findMany({
        where: {
          estado: { in: ["CONFIRMADA", "PENDIENTE"] },
          fechaCheckIn: { lte: todayEnd },
          fechaCheckOut: { gte: todayStart },
        },
        select: { habitacionId: true },
      }),
      db.reserva.count({
        where: {
          fechaCheckIn: { gte: todayStart, lte: todayEnd },
          estado: { in: ["PENDIENTE", "CONFIRMADA"] },
        },
      }),
      db.reserva.count({
        where: {
          fechaCheckOut: { gte: todayStart, lte: todayEnd },
          estado: "CONFIRMADA",
        },
      }),
      db.reserva.count({
        where: { estado: "PENDIENTE" },
      }),
      db.reservaServicio.findMany({
        where: {
          fechaServicio: { gte: todayStart, lte: todayEnd },
          reserva: { estado: { in: ["CONFIRMADA", "PENDIENTE"] } },
        },
      }),
    ]);

    const habitacionesOcupadasHoy = new Set(reservasOcupadasHoy.map((r) => r.habitacionId)).size;
    const porcentajeOcupacion = totalHabitaciones > 0 ? parseFloat(((habitacionesOcupadasHoy / totalHabitaciones) * 100).toFixed(1)) : 0;

    const desayunos = serviciosHoy.reduce((acc, curr) => acc + curr.desayunosCant, 0);
    const colaciones = serviciosHoy.reduce((acc, curr) => acc + curr.colacionesCant, 0);
    const cenas = serviciosHoy.reduce((acc, curr) => acc + curr.cenasCant, 0);
    const almuerzos = Math.max(desayunos, cenas);

    return {
      habitacionesOcupadasHoy,
      totalHabitaciones,
      porcentajeOcupacion,
      checkInsHoyCount,
      checkOutsHoyCount,
      solicitudesPendientesCount,
      racionesHoy: { desayunos, almuerzos, cenas, colaciones },
    };
  } catch (error) {
    console.error("Error al calcular KPIs del dashboard:", error);
    return {
      habitacionesOcupadasHoy: 0,
      totalHabitaciones: 4,
      porcentajeOcupacion: 0,
      checkInsHoyCount: 0,
      checkOutsHoyCount: 0,
      solicitudesPendientesCount: 0,
      racionesHoy: { desayunos: 0, almuerzos: 0, cenas: 0, colaciones: 0 },
    };
  }
}

export async function getProximosCheckIns() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const next2Days = new Date();
  next2Days.setDate(next2Days.getDate() + 2);
  next2Days.setHours(23, 59, 59, 999);

  try {
    const list = await db.reserva.findMany({
      where: {
        fechaCheckIn: { gte: now, lte: next2Days },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
      include: {
        cliente: true,
        habitacion: true,
      },
      orderBy: { fechaCheckIn: "asc" },
      take: 5,
    });

    // Sanitización de objetos Prisma Decimal y Date para pasar solo plain objects
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
    console.error("Error al obtener próximos check-ins:", error);
    return [];
  }
}

export async function getSolicitudesPendientes() {
  try {
    const list = await db.reserva.findMany({
      where: { estado: "PENDIENTE" },
      include: {
        cliente: true,
        habitacion: true,
        servicios: true,
      },
      orderBy: { createdAt: "desc" },
    });

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
    console.error("Error al obtener solicitudes pendientes:", error);
    return [];
  }
}

// CÓMPUTO DINÁMICO OPTIMIZADO EN BATCH (2 CONSULTAS EN LUGAR DE 14)
export async function getAnalyticsData() {
  try {
    const dStart7 = new Date();
    dStart7.setHours(0, 0, 0, 0);

    const dEnd7 = new Date(dStart7);
    dEnd7.setDate(dEnd7.getDate() + 7);
    dEnd7.setHours(23, 59, 59, 999);

    // Consultas ejecutadas en paralelo con Promise.all
    const [totalHabitacionesCount, reservas7Dias, servicios7Dias, todasReservas, totalFaena, totalTurista] = await Promise.all([
      db.habitacion.count(),
      db.reserva.findMany({
        where: {
          estado: { in: ["CONFIRMADA", "PENDIENTE"] },
          fechaCheckIn: { lte: dEnd7 },
          fechaCheckOut: { gte: dStart7 },
        },
        select: { habitacionId: true, fechaCheckIn: true, fechaCheckOut: true },
      }),
      db.reservaServicio.findMany({
        where: {
          fechaServicio: { gte: dStart7, lte: dEnd7 },
          reserva: { estado: { in: ["CONFIRMADA", "PENDIENTE"] } },
        },
      }),
      db.reserva.findMany({
        where: { estado: { in: ["CONFIRMADA", "PENDIENTE"] } },
        include: { habitacion: true, servicios: true },
      }),
      db.cliente.count({ where: { tipo: "TRABAJADOR_FAENA" } }),
      db.cliente.count({ where: { tipo: "TURISTA" } }),
    ]);

    const totalHabitaciones = Math.max(1, totalHabitacionesCount);
    const proyeccionOcupacion = [];
    const proyeccionRaciones = [];
    const diasNombres = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const dEndDay = new Date(d);
      dEndDay.setHours(23, 59, 59, 999);

      const label = `${diasNombres[d.getDay()]} ${d.getDate()}`;

      // Filtrar reservas en memoria (0ms latency)
      const habitacionIdsOcupadas = new Set(
        reservas7Dias
          .filter((r) => new Date(r.fechaCheckIn) <= dEndDay && new Date(r.fechaCheckOut) >= d)
          .map((r) => r.habitacionId)
      );

      const camas = habitacionIdsOcupadas.size;
      const ocupacionPct = parseFloat(((camas / totalHabitaciones) * 100).toFixed(1));

      proyeccionOcupacion.push({ dia: label, ocupacionPct, camas });

      // Filtrar servicios en memoria (0ms latency)
      const servsDia = servicios7Dias.filter((s) => {
        const f = new Date(s.fechaServicio);
        return f >= d && f <= dEndDay;
      });

      const desayunos = servsDia.reduce((acc: number, curr) => acc + curr.desayunosCant, 0);
      const colaciones = servsDia.reduce((acc: number, curr) => acc + curr.colacionesCant, 0);
      const cenas = servsDia.reduce((acc: number, curr) => acc + curr.cenasCant, 0);

      proyeccionRaciones.push({ dia: label, desayunos, colaciones, cenas });
    }

    // Cálculo de Ingresos
    let montoHospedaje = 0;
    let montoAlimentacion = 0;

    for (const r of todasReservas) {
      const inD = new Date(r.fechaCheckIn).getTime();
      const outD = new Date(r.fechaCheckOut).getTime();
      const diffDays = Math.max(1, Math.ceil((outD - inD) / (1000 * 3600 * 24)));
      const precioBase = Number(r.habitacion?.precioBase || 25000);

      montoHospedaje += precioBase * diffDays;

      if (r.servicios && r.servicios.length > 0) {
        for (const s of r.servicios) {
          montoAlimentacion += (s.desayunosCant * 4000 + s.colacionesCant * 6000 + s.cenasCant * 8000) * diffDays;
        }
      }
    }

    const totalMonto = montoHospedaje + montoAlimentacion;
    const pctHospedaje = totalMonto > 0 ? Math.round((montoHospedaje / totalMonto) * 100) : 70;
    const pctAlimentacion = totalMonto > 0 ? 100 - pctHospedaje : 30;

    const distribucionIngresosData = [
      { name: "🛏️ Hospedaje (Camas)", value: montoHospedaje, porcentaje: pctHospedaje, color: "#D9583B" },
      { name: "🍽️ Alimentación (Comidas)", value: montoAlimentacion, porcentaje: pctAlimentacion, color: "#1EAD50" },
    ];

    // Cálculo de Ingresos Reales por Canal de Pago
    let totalDebito = 0;
    let totalCredito = 0;
    let totalTransferencia = 0;

    for (const r of todasReservas) {
      const monto = Number(r.montoPagado || 0);
      const metodo = r.metodoPago;

      if (monto > 0) {
        if (metodo === "DEBITO") {
          totalDebito += monto;
        } else if (metodo === "CREDITO") {
          totalCredito += monto;
        } else {
          totalTransferencia += monto;
        }
      } else {
        // Fallback para registros antiguos (antes de implementar pagos)
        const inD = new Date(r.fechaCheckIn).getTime();
        const outD = new Date(r.fechaCheckOut).getTime();
        const diffDays = Math.max(1, Math.ceil((outD - inD) / (1000 * 3600 * 24)));
        const precioBase = Number(r.habitacion?.precioBase || 25000);
        let estimado = precioBase * diffDays;
        if (r.servicios && r.servicios.length > 0) {
          for (const s of r.servicios) {
            estimado += (s.desayunosCant * 4000 + s.colacionesCant * 6000 + s.cenasCant * 8000) * diffDays;
          }
        }
        totalTransferencia += estimado;
      }
    }

    const sumaPagos = totalDebito + totalCredito + totalTransferencia;
    const pctDebito = sumaPagos > 0 ? Math.round((totalDebito / sumaPagos) * 100) : 0;
    const pctCredito = sumaPagos > 0 ? Math.round((totalCredito / sumaPagos) * 100) : 0;
    const pctTransf = sumaPagos > 0 ? 100 - (pctDebito + pctCredito) : 100;

    const distribucionPagosData = [
      { name: "💳 Débito (Webpay)", value: totalDebito, porcentaje: pctDebito, color: "#10b981" },
      { name: "💳 Crédito (Webpay)", value: totalCredito, porcentaje: pctCredito, color: "#f59e0b" },
      { name: "🏦 Transferencia", value: totalTransferencia, porcentaje: pctTransf, color: "#D9583B" },
    ];

    const totalClientes = totalFaena + totalTurista;
    const pctFaena = totalClientes > 0 ? Math.round((totalFaena / totalClientes) * 100) : 75;
    const pctTurista = totalClientes > 0 ? 100 - pctFaena : 25;

    const distribucionClientesData = [
      { name: "👷 Trabajadores de Faena", value: pctFaena, color: "#1EAD50" },
      { name: "🌴 Turistas / Particulares", value: pctTurista, color: "#f59e0b" },
    ];

    return {
      proyeccionOcupacion,
      proyeccionRaciones,
      distribucionIngresosData,
      distribucionPagosData,
      distribucionClientesData,
    };
  } catch (error) {
    console.error("Error al calcular analítica dinámica:", error);
    return {
      proyeccionOcupacion: [],
      proyeccionRaciones: [],
      distribucionIngresosData: [],
      distribucionPagosData: [],
      distribucionClientesData: [],
    };
  }
}
