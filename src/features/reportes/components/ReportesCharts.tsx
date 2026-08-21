"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { formatCLP } from "@/shared/utils/formatters";

interface ReportesChartsProps {
  distribucionIngresosData?: any[];
  distribucionPagosData?: any[];
}

export function ReportesCharts({
  distribucionIngresosData,
  distribucionPagosData,
}: ReportesChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const dataIngresos = distribucionIngresosData || [
    { name: "🛏️ Hospedaje (Camas)", value: 1625000, porcentaje: 65, color: "#D9583B" },
    { name: "🍽️ Alimentación (Comidas)", value: 875000, porcentaje: 35, color: "#1EAD50" },
  ];

  const dataPagos = distribucionPagosData || [
    { name: "💳 Débito (Webpay)", value: 450000, porcentaje: 18, color: "#10b981" },
    { name: "💳 Crédito (Webpay)", value: 300000, porcentaje: 12, color: "#f59e0b" },
    { name: "🏦 Transferencia", value: 1750000, porcentaje: 70, color: "#D9583B" },
  ];

  if (!isMounted) {
    return (
      <div className="p-8 text-center bg-sand-deep/20 rounded-3xl border border-sand-border text-xs text-muted">
        Cargando tableros de análisis financiero...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand-border pb-3 pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta">
          📈 Análisis de Flujo de Caja y Canales
        </span>
        <h2 className="text-xl font-serif font-bold text-ink mt-0.5">
          Composición de Ingresos y Medios de Pago
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GRÁFICO 1: HOSPEDAJE VS ALIMENTACIÓN */}
        <div className="bg-card border border-sand-border rounded-2xl p-5 shadow-xs space-y-4" style={{ background: "#FFFAF1" }}>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-terracotta">
              Composición Comercial
            </span>
            <h3 className="font-serif font-bold text-base text-ink mt-0.5">
              Recaudación: Hospedaje vs. Cocina
            </h3>
            <p className="text-muted text-[11px]">
              Demuestra el peso que tiene la cocina en la rentabilidad total de la pensión.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataIngresos}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataIngresos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCLP(val), "Monto Estimado"]}
                    contentStyle={{ backgroundColor: "#FFFAF1", borderRadius: "12px", border: "1px solid #DDD0B3", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {dataIngresos.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-sand-deep/20 border border-sand-border/60 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="text-terracotta">{item.porcentaje}%</span>
                  </div>
                  <div className="text-xs font-serif font-bold text-ink text-right">
                    {formatCLP(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRÁFICO 2: CANALES DE PAGO */}
        <div className="bg-card border border-sand-border rounded-2xl p-5 shadow-xs space-y-4" style={{ background: "#FFFAF1" }}>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
              Caja & Transacciones
            </span>
            <h3 className="font-serif font-bold text-base text-ink mt-0.5">
              Ingresos por Canal de Pago
            </h3>
            <p className="text-muted text-[11px]">
              Monto total transado acumulado según el medio de pago electrónico o manual.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPagos}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {dataPagos.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCLP(val), "Monto Recibido"]}
                    contentStyle={{ backgroundColor: "#FFFAF1", borderRadius: "12px", border: "1px solid #DDD0B3", fontSize: "11px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {dataPagos.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-sand-deep/20 border border-sand-border/60 space-y-0.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-ink">
                    <span className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      {item.name}
                    </span>
                    <span className="text-terracotta">{item.porcentaje}%</span>
                  </div>
                  <div className="text-xs font-serif font-bold text-ink text-right">
                    {formatCLP(item.value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
