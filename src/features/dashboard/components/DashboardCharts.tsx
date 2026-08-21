"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";
import { formatCLP } from "@/shared/utils/formatters";

interface DashboardChartsProps {
  proyeccionOcupacion?: any[];
  proyeccionRaciones?: any[];
  habitacionesMasArrendadasData?: any[];
}

export function DashboardCharts({
  proyeccionOcupacion,
  proyeccionRaciones,
  habitacionesMasArrendadasData,
}: DashboardChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dataOcupacion = proyeccionOcupacion || [
    { dia: "Mié 12", ocupacionPct: 62.5, camas: 5 },
    { dia: "Jue 13", ocupacionPct: 75.0, camas: 6 },
    { dia: "Vie 14", ocupacionPct: 87.5, camas: 7 },
    { dia: "Sáb 15", ocupacionPct: 100.0, camas: 8 },
    { dia: "Dom 16", ocupacionPct: 62.5, camas: 5 },
    { dia: "Lun 17", ocupacionPct: 87.5, camas: 7 },
    { dia: "Mar 18", ocupacionPct: 75.0, camas: 6 },
  ];

  const dataRaciones = proyeccionRaciones || [
    { dia: "Mié 12", desayunos: 12, colaciones: 8, cenas: 10 },
    { dia: "Jue 13", desayunos: 14, colaciones: 10, cenas: 12 },
    { dia: "Vie 14", desayunos: 16, colaciones: 14, cenas: 15 },
    { dia: "Sáb 15", desayunos: 18, colaciones: 16, cenas: 16 },
    { dia: "Dom 16", desayunos: 12, colaciones: 6, cenas: 10 },
    { dia: "Lun 17", desayunos: 16, colaciones: 12, cenas: 14 },
    { dia: "Mar 18", desayunos: 14, colaciones: 10, cenas: 12 },
  ];

  const dataHabitaciones = habitacionesMasArrendadasData || [
    { name: "Pieza 1 (Matrimonial)", noches: 26, color: "#D9583B" },
    { name: "Pieza 2 (Doble Familiar)", noches: 19, color: "#1EAD50" },
    { name: "Pieza 3 (Single Operativa)", noches: 14, color: "#f59e0b" },
    { name: "Pieza 4 (Doble Estándar)", noches: 9, color: "#3b82f6" },
  ];

  if (!isMounted) {
    return (
      <div className="p-8 text-center bg-sand-deep/20 rounded-3xl border border-sand-border text-xs text-muted">
        Cargando tableros de analítica estratégica...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER DE LA SECCIÓN DE ANALÍTICA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-sand-border pb-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            📈 Métricas Estratégicas para la Toma de Decisiones
          </div>
          <h2 className="text-2xl font-serif font-bold text-ink">
            Tablero de Proyección y Ocupación
          </h2>
        </div>
        <span className="text-xs font-semibold text-muted bg-sand-deep/40 px-3 py-1 rounded-full border border-sand-border">
          Actualizado en tiempo real
        </span>
      </div>

      {/* FILA 1: OCUPACIÓN SEMANAL Y PROYECTO DE RACIONES DE COCINA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GRÁFICO 1: OCUPACIÓN SEMANAL / MENSUAL (ÁREA) */}
        <div className="bg-card border border-sand-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
                Gráfico 1 · Capacidad de Camas
              </span>
              <h3 className="font-serif font-bold text-lg text-ink mt-0.5">
                Proyección de Ocupación Semanal (%)
              </h3>
              <p className="text-muted text-xs">
                Anticipa días de alta demanda por cuadrillas de faena o baja ocupación.
              </p>
            </div>
            <span className="text-xs font-bold text-terracotta bg-terracotta/10 px-3 py-1 rounded-full">
              7 Días
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataOcupacion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="terracottaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D9583B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D9583B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#7A6F5A" }} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#7A6F5A" }} unit="%" axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val}% de Ocupación`, "Ocupación"]}
                  contentStyle={{ backgroundColor: "#FFFAF1", borderRadius: "12px", border: "1px solid #DDD0B3", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="ocupacionPct" stroke="#D9583B" strokeWidth={3} fillOpacity={1} fill="url(#terracottaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICO 2: PROYECCIÓN DE RACIONES DE COCINA (BARRAS APILADAS) */}
        <div className="bg-card border border-sand-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Gráfico 2 · Planificación de Mercadería
              </span>
              <h3 className="font-serif font-bold text-lg text-ink mt-0.5">
                Proyección de Raciones de Cocina
              </h3>
              <p className="text-muted text-xs">
                Insumos diarios a preparar para evitar faltantes o mermas de comida.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Cocina
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataRaciones} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#7A6F5A" }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#7A6F5A" }} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#FFFAF1", borderRadius: "12px", border: "1px solid #DDD0B3", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="desayunos" name="🥐 Desayunos" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                <Bar dataKey="colaciones" name="🍱 Viandas Faena" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="cenas" name="🍲 Cenas" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILA 2: HABITACIONES MÁS ARRENDADAS (Toma de Decisiones) */}
      <div className="grid grid-cols-1 gap-8">
        {/* GRÁFICO 3: HABITACIONES MÁS ARRENDADAS (BARRAS HORIZONTALES GRANDES) */}
        <div className="bg-card border border-sand-border rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                Gráfico 3 · Preferencias de Alojamiento y Demanda
              </span>
              <h3 className="font-serif font-bold text-lg text-ink mt-0.5">
                Pieza Más Arrendada
              </h3>
              <p className="text-muted text-xs">
                Métricas de noches arrendadas en total para evaluar la habitación favorita de los huéspedes.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              Demanda
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={dataHabitaciones}
                margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#7A6F5A" }} axisLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#2A2418", fontWeight: "bold" }} axisLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} Noches Arrendadas`, "Ocupación Acumulada"]}
                  contentStyle={{ backgroundColor: "#FFFAF1", borderRadius: "12px", border: "1px solid #DDD0B3", fontSize: "12px" }}
                />
                <Bar dataKey="noches" radius={[0, 6, 6, 0]} barSize={22}>
                  {dataHabitaciones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
