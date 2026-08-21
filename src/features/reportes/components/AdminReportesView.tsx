"use client";

import { useState } from "react";
import { ReporteDatos } from "../services/reportes";
import { formatCLP, formatDateCL } from "@/shared/utils/formatters";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ReportesCharts } from "./ReportesCharts";

interface AdminReportesViewProps {
  reportes: ReporteDatos;
  reservas: any[];
  distribucionIngresosData?: any[];
  distribucionPagosData?: any[];
}

export function AdminReportesView({
  reportes,
  reservas,
  distribucionIngresosData,
  distribucionPagosData,
}: AdminReportesViewProps) {
  // Parámetros para Formulario de Cuenta Empresa
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState<string>("Minera Paposo SpA");
  const [mesEmpresa, setMesEmpresa] = useState<string>("2026-08");

  // Parámetros para Reporte Ocupación
  const [mesOcupacion, setMesOcupacion] = useState<string>("2026-08");

  // Parámetros para Reporte Ingresos
  const [mesIngresos, setMesIngresos] = useState<string>("2026-08");

  // Parámetros para Exportar Reservas Excel
  const [estadoReservaExcel, setEstadoReservaExcel] = useState<string>("TODOS");

  // Lista única de empresas registradas en las reservas
  const empresasDisponibles = Array.from(
    new Set(
      reservas
        .filter((r) => r.cliente?.empresa && r.cliente?.empresa.trim() !== "")
        .map((r) => r.cliente.empresa)
    )
  );

  if (empresasDisponibles.length === 0) {
    empresasDisponibles.push("Minera Paposo SpA", "Contratistas Taltal S.A.", "Constructora Costera");
  }

  // ==========================================
  // ESTILOS COMUNES Y CONSTRUCTORES DE PDF
  // ==========================================
  const drawPDFHeader = (doc: jsPDF, title: string, subtitle: string) => {
    // Franja superior institucional
    doc.setFillColor(42, 36, 24); // #2A2418 (Tinta)
    doc.rect(0, 0, 210, 38, "F");

    // Línea de acento Terracota
    doc.setFillColor(217, 88, 59); // #D9583B (Terracota)
    doc.rect(0, 38, 210, 2, "F");

    // Título de la empresa
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("PENSIÓN SEÑORA MYRIAM", 14, 16);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Alojamiento Familiar & Comida Casera en Paposo", 14, 23);
    doc.text("Dirección: Calle Principal S/N, Caleta Paposo, Comuna de Taltal", 14, 28);
    doc.text("Teléfono: +56 9 4019 9049 | Correo: contacto@pensionmyriam.cl", 14, 33);

    // Caja de Documento / Título en la cabecera
    doc.setTextColor(42, 36, 24);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, 52);

    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(122, 111, 90);
    doc.text(subtitle, 14, 58);

    // Línea divisoria inferior de metadatos
    doc.setDrawColor(221, 208, 179);
    doc.setLineWidth(0.5);
    doc.line(14, 62, 196, 62);
  };

  const drawPDFFooter = (doc: jsPDF, finalY: number) => {
    // Bloque de Datos de Transferencia Bancaria (para Cobro Empresa)
    doc.setFillColor(255, 250, 241); // #FFFAF1 (Fondo card)
    doc.setDrawColor(221, 208, 179); // #DDD0B3 (Sand border)
    doc.setLineWidth(0.5);
    doc.roundedRect(14, finalY + 5, 182, 28, 3, 3, "FD");

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(42, 36, 24);
    doc.text("INFORMACIÓN DE PAGO Y TRANSFERENCIA BANCARIA", 18, finalY + 11);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Banco: BancoEstado", 18, finalY + 17);
    doc.text("Tipo Cuenta: Cuenta RUT / Vista", 18, finalY + 22);
    doc.text("Titular: Myriam del Carmen Pastora", 90, finalY + 17);
    doc.text("RUT: 9.876.543-2", 90, finalY + 22);
    doc.text("N° Cuenta: 9876543", 155, finalY + 17);
    doc.text("Correo: pagos@pensionmyriam.cl", 155, finalY + 22);
    doc.text("Nota: Favor enviar comprobante de pago vía correo o WhatsApp al +56 9 4019 9049 para procesar la confirmación.", 18, finalY + 29);

    // Firmas
    doc.setFontSize(8.5);
    doc.setTextColor(122, 111, 90);
    doc.text("__________________________________________", 120, finalY + 52);
    doc.text("Firma de Administración & Recepción", 126, finalY + 57);
    doc.setFont("helvetica", "bold");
    doc.text("Pensión Señora Myriam", 138, finalY + 62);
  };

  // ==========================================
  // 1. GENERADOR DE CUENTA PDF PARA EMPRESA
  // ==========================================
  const handleGenerarCuentaEmpresaPDF = () => {
    const doc = new jsPDF();
    
    // Encabezado
    drawPDFHeader(
      doc, 
      "ESTADO DE CUENTA DE HOSPEDAJE Y SERVICIOS",
      `Documento emitido formalmente para consolidar pernoctaciones y alimentación del personal.`
    );

    // Datos del Cliente Empresa
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(42, 36, 24);
    doc.text("DATOS DE FACTURACIÓN Y EMISIÓN", 14, 70);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Empresa Cliente:  ${empresaSeleccionada}`, 14, 76);
    doc.text(`Período Mensual:   ${mesEmpresa}`, 14, 81);
    doc.text(`Fecha de Emisión:  ${formatDateCL(new Date())}`, 14, 86);

    // Caja de número de documento a la derecha
    doc.setFillColor(255, 250, 241);
    doc.setDrawColor(217, 88, 59);
    doc.setLineWidth(0.8);
    doc.roundedRect(125, 68, 71, 20, 2, 2, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(217, 88, 59);
    doc.setFontSize(10);
    doc.text(`NOTA DE COBRO N°:`, 130, 75);
    doc.setFontSize(12);
    doc.text(`EM-${mesEmpresa.replace("-", "")}-001`, 130, 83);

    // Filtrar trabajadores de esa empresa
    const trabajadoresEmpresa = reservas.filter(
      (r) => r.cliente?.empresa === empresaSeleccionada || r.cliente?.tipo === "TRABAJADOR_FAENA"
    );

    const tableRows = trabajadoresEmpresa.length > 0
      ? trabajadoresEmpresa.map((r) => {
          const inDate = new Date(r.fechaCheckIn);
          const outDate = new Date(r.fechaCheckOut);
          const noches = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24)));
          const precioHab = Number(r.habitacion?.precioBase || 30000);
          const totalFila = precioHab * noches;

          return [
            r.cliente?.nombre || "Trabajador Faena",
            r.habitacion?.numero || "Pieza",
            inDate.toLocaleDateString("es-CL"),
            outDate.toLocaleDateString("es-CL"),
            `${noches} noche(s)`,
            formatCLP(precioHab),
            formatCLP(totalFila),
          ];
        })
      : [
          ["Juan Pérez (Ejemplo)", "Pieza 3 — Ejecutiva Faena", "01/08/2026", "10/08/2026", "9 noche(s)", "$ 30.000", "$ 270.000"],
          ["Carlos Gómez (Ejemplo)", "Pieza 4 — Doble Paposo", "05/08/2026", "12/08/2026", "7 noche(s)", "$ 28.000", "$ 196.000"],
        ];

    autoTable(doc, {
      startY: 94,
      head: [["Trabajador / Huésped", "Habitación", "Check-in", "Check-out", "Noches", "Tarifa / Noche", "Subtotal"]],
      body: tableRows,
      headStyles: { fillColor: [217, 88, 59], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 8.5, cellPadding: 3.5, font: "helvetica" },
      alternateRowStyles: { fillColor: [255, 250, 241] },
      columnStyles: {
        6: { halign: "right", fontStyle: "bold" },
      }
    });

    // Total a Cobrar
    const finalY = (doc as any).lastAutoTable.finalY;
    const totalCobrar = trabajadoresEmpresa.reduce((acc, r) => {
      const inDate = new Date(r.fechaCheckIn);
      const outDate = new Date(r.fechaCheckOut);
      const noches = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24)));
      return acc + Number(r.habitacion?.precioBase || 30000) * noches;
    }, 0) || 466000;

    // Caja de Totalización
    doc.setFillColor(255, 250, 241);
    doc.rect(125, finalY + 4, 71, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(217, 88, 59);
    doc.text(`TOTAL A PAGAR:`, 128, finalY + 10.5);
    doc.text(`${formatCLP(totalCobrar)}`, 164, finalY + 10.5, { align: "left" });

    // Pie de página con datos bancarios
    drawPDFFooter(doc, finalY + 18);

    doc.save(`Cuenta_Empresa_${empresaSeleccionada.replace(/\s+/g, "_")}_${mesEmpresa}.pdf`);
  };

  // ==========================================
  // 2. REPORTE OCUPACIÓN (PDF & EXCEL)
  // ==========================================
  const handleExportOcupacionPDF = () => {
    const doc = new jsPDF();
    
    // Encabezado
    drawPDFHeader(
      doc,
      "REPORTE MENSUAL DE OCUPACIÓN Y CAPACIDAD",
      "Estadísticas detalladas de ocupación hotelera en Pensión Sra. Myriam (Paposo)."
    );

    // Resumen Operativo
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(42, 36, 24);
    doc.text("RESUMEN DE MÉTRICAS OPERATIVAS", 14, 70);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Mes del Reporte:           ${mesOcupacion}`, 14, 76);
    doc.text(`Ocupación Promedio:        ${reportes.ocupacionPromedio}%`, 14, 81);
    doc.text(`Noches Vendidas Totales:   ${reportes.totalNochesVendidas} noches`, 14, 86);

    const rows = reportes.ocupacionDiaria.map((d) => [
      `Día ${d.dia}`, 
      `${d.ocupacion}%`,
      d.ocupacion >= 80 ? "🔴 Alta Ocupación" : d.ocupacion >= 40 ? "🟡 Ocupación Media" : "🟢 Baja Ocupación"
    ]);

    autoTable(doc, {
      startY: 94,
      head: [["Día del Mes", "Porcentaje de Ocupación", "Evaluación de Estado"]],
      body: rows,
      headStyles: { fillColor: [30, 173, 80], textColor: [255, 255, 255], fontStyle: "bold" }, // Cactus
      styles: { fontSize: 8.5, cellPadding: 3.5 },
      alternateRowStyles: { fillColor: [255, 250, 241] },
    });

    doc.save(`Reporte_Ocupacion_${mesOcupacion}.pdf`);
  };

  const handleExportOcupacionExcel = () => {
    const data = reportes.ocupacionDiaria.map((d) => ({
      "Día del Mes": d.dia,
      "Porcentaje Ocupación (%)": `${d.ocupacion}%`,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ocupacion");
    XLSX.writeFile(workbook, `Reporte_Ocupacion_${mesOcupacion}.xlsx`);
  };

  // ==========================================
  // 3. REPORTE INGRESOS (PDF & EXCEL)
  // ==========================================
  const handleExportIngresosPDF = () => {
    const doc = new jsPDF();
    
    // Encabezado
    drawPDFHeader(
      doc,
      "REPORTE MENSUAL DE INGRESOS Y RECAUDACIÓN",
      "Detalle de ingresos por servicios de hospedaje y alimentación de la Pensión Sra. Myriam."
    );

    // Resumen Financiero
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(42, 36, 24);
    doc.text("RESUMEN DE INGRESOS ESTIMADOS", 14, 70);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80);
    doc.text(`Mes de Recaudación:      ${mesIngresos}`, 14, 76);
    doc.text(`Ingreso Mensual Total:   ${formatCLP(reportes.totalIngresos)}`, 14, 81);

    const rows = reportes.ingresosMensuales.map((i) => [i.categoria, formatCLP(i.valor)]);

    autoTable(doc, {
      startY: 90,
      head: [["Categoría de Ingreso / Servicio", "Total Recaudado (CLP)"]],
      body: rows,
      headStyles: { fillColor: [217, 88, 59], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9.5, cellPadding: 4 },
      alternateRowStyles: { fillColor: [255, 250, 241] },
      columnStyles: {
        1: { halign: "right", fontStyle: "bold" },
      }
    });

    doc.save(`Reporte_Ingresos_${mesIngresos}.pdf`);
  };

  const handleExportIngresosExcel = () => {
    const data = reportes.ingresosMensuales.map((i) => ({
      "Categoría de Ingreso": i.categoria,
      "Monto CLP": i.valor,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ingresos");
    XLSX.writeFile(workbook, `Reporte_Ingresos_${mesIngresos}.xlsx`);
  };

  // ==========================================
  // 4. EXPORTAR TODAS LAS RESERVAS A EXCEL
  // ==========================================
  const handleExportTodasReservasExcel = () => {
    const reservsFiltradas = reservas.filter((r) => {
      if (estadoReservaExcel === "TODOS") return true;
      return r.estado === estadoReservaExcel;
    });

    const dataToExport = (reservsFiltradas.length > 0 ? reservsFiltradas : reservas).map((r) => {
      const inDate = new Date(r.fechaCheckIn);
      const outDate = new Date(r.fechaCheckOut);
      const noches = Math.max(1, Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 3600 * 24)));

      return {
        "ID Reserva": r.id,
        "Huésped": r.cliente?.nombre || "N/A",
        "Teléfono": r.cliente?.telefono || "N/A",
        "Tipo Huésped": r.cliente?.tipo === "TRABAJADOR_FAENA" ? "Trabajador Faena" : "Turista",
        "Empresa": r.cliente?.empresa || "Particular",
        "Habitación": r.habitacion?.numero || "Pieza",
        "Check-in": inDate.toLocaleDateString("es-CL"),
        "Check-out": outDate.toLocaleDateString("es-CL"),
        "Noches": noches,
        "Estado": r.estado,
        "Precio Noche": r.habitacion?.precioBase ? Number(r.habitacion.precioBase) : 25000,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservas_Completas");
    XLSX.writeFile(workbook, `Exportacion_Reservas_${estadoReservaExcel}.xlsx`);
  };

  return (
    <div className="space-y-7 select-none">
      {/* ── PAGE HEADER ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] mb-2" style={{ color: "#7A6F5A" }}>
            <span>Admin</span><span>›</span>
            <span style={{ color: "#2A2418", fontWeight: 600 }}>Reportes & Exportaciones</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-ink">
            Centro de Documentos y Reportes 📈
          </h1>
          <p className="text-sm mt-1" style={{ color: "#7A6F5A" }}>
            Generación de facturas PDF para empresas y exportaciones a Excel.
          </p>
        </div>
      </div>

      {/* 1. TARJETAS KPI DE RESUMEN OPERATIVO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Ocupación */}
        <div className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
          style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 4px rgba(42,36,24,0.06)" }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
            style={{ background: "rgba(30,173,80,0.12)", color: "#1EAD50" }}>
            📊
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate" style={{ color: "#7A6F5A" }}>Ocupación Promedio</div>
            <div className="font-serif font-bold text-2xl leading-none text-cactus">{reportes.ocupacionPromedio}%</div>
            <div className="text-[11px] mt-1 truncate" style={{ color: "#7A6F5A" }}>Capacidad del mes</div>
          </div>
        </div>

        {/* Noches Vendidas */}
        <div className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
          style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 4px rgba(42,36,24,0.06)" }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
            style={{ background: "rgba(217,88,59,0.12)", color: "#D9583B" }}>
            🌙
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate" style={{ color: "#7A6F5A" }}>Noches Vendidas</div>
            <div className="font-serif font-bold text-2xl leading-none text-terracotta">{reportes.totalNochesVendidas}</div>
            <div className="text-[11px] mt-1 truncate" style={{ color: "#7A6F5A" }}>Pernoctaciones registradas</div>
          </div>
        </div>

        {/* Ingresos Mensuales */}
        <div className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5"
          style={{ background: "#FFFAF1", border: "1px solid #DDD0B3", boxShadow: "0 1px 4px rgba(42,36,24,0.06)" }}>
          <div className="w-12 h-12 rounded-xl grid place-items-center text-xl flex-shrink-0"
            style={{ background: "rgba(42,36,24,0.12)", color: "#2A2418" }}>
            💰
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5 truncate" style={{ color: "#7A6F5A" }}>Ingresos Mensuales</div>
            <div className="font-serif font-bold text-2xl leading-none text-ink">{formatCLP(reportes.totalIngresos)}</div>
            <div className="text-[11px] mt-1 truncate" style={{ color: "#7A6F5A" }}>Hospedaje + Comidas</div>
          </div>
        </div>
      </div>

      {/* BLOQUE GRÁFICOS FINANCIEROS */}
      <div className="bg-card border border-sand-border rounded-3xl p-6 shadow-sm space-y-4">
        <ReportesCharts
          distribucionIngresosData={distribucionIngresosData}
          distribucionPagosData={distribucionPagosData}
        />
      </div>

      {/* 2. BLOQUES DE TIPOS DE REPORTE Y PARÁMETROS */}
      <div className="space-y-6 pt-2">
        <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#7A6F5A" }}>
          📄 Generador de Reportes y Documentos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* BLOQUE 1: Cuenta PDF para Empresas */}
          <div className="bg-card border border-sand-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            style={{ background: "#FFFAF1" }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center font-bold text-lg">
                  🏬
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2A2418] text-base sm:text-lg">
                    Cuenta PDF para Empresas de Faena
                  </h3>
                  <p className="text-xs text-muted">
                    Genera el detalle formal en PDF para cobrar hospedaje y colaciones a contratistas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Seleccionar Empresa
                  </label>
                  <select
                    value={empresaSeleccionada}
                    onChange={(e) => setEmpresaSeleccionada(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none"
                  >
                    {empresasDisponibles.map((emp) => (
                      <option key={emp} value={emp}>
                        {emp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                    Período / Mes
                  </label>
                  <input
                    type="month"
                    value={mesEmpresa}
                    onChange={(e) => setMesEmpresa(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerarCuentaEmpresaPDF}
              className="w-full mt-6 bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-xl py-3 text-xs shadow-sm transition-all hover:-translate-y-0.5"
            >
              📄 Generar Cuenta Empresa (PDF)
            </button>
          </div>

          {/* BLOQUE 2: Reporte de Ocupación (PDF / Excel) */}
          <div className="bg-card border border-sand-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            style={{ background: "#FFFAF1" }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center font-bold text-lg">
                  📊
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2A2418] text-base sm:text-lg">
                    Reporte de Ocupación del Mes
                  </h3>
                  <p className="text-xs text-muted">
                    Desglose diario de habitaciones ocupadas y porcentajes de uso.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                  Seleccionar Mes
                </label>
                <input
                  type="month"
                  value={mesOcupacion}
                  onChange={(e) => setMesOcupacion(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6">
              <button
                onClick={handleExportOcupacionPDF}
                className="bg-white text-ink font-semibold rounded-xl py-3 text-xs border border-sand-border hover:bg-sand-deep/40 transition-all flex items-center justify-center gap-1.5"
              >
                <span>📄 Descargar PDF</span>
              </button>
              <button
                onClick={handleExportOcupacionExcel}
                className="bg-[#1EAD50] hover:bg-green-700 text-white font-semibold rounded-xl py-3 text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>📊 Descargar Excel</span>
              </button>
            </div>
          </div>

          {/* BLOQUE 3: Reporte de Ingresos (PDF / Excel) */}
          <div className="bg-card border border-sand-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            style={{ background: "#FFFAF1" }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 text-terracotta grid place-items-center font-bold text-lg">
                  💰
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2A2418] text-base sm:text-lg">
                    Reporte de Ingresos Mensuales
                  </h3>
                  <p className="text-xs text-muted">
                    Desglose comparativo de recaudación por hospedaje vs. alimentación.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                  Seleccionar Mes
                </label>
                <input
                  type="month"
                  value={mesIngresos}
                  onChange={(e) => setMesIngresos(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6">
              <button
                onClick={handleExportIngresosPDF}
                className="bg-white text-ink font-semibold rounded-xl py-3 text-xs border border-sand-border hover:bg-sand-deep/40 transition-all flex items-center justify-center gap-1.5"
              >
                <span>📄 Descargar PDF</span>
              </button>
              <button
                onClick={handleExportIngresosExcel}
                className="bg-[#1EAD50] hover:bg-green-700 text-white font-semibold rounded-xl py-3 text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <span>📊 Descargar Excel</span>
              </button>
            </div>
          </div>

          {/* BLOQUE 4: Exportar Reservas Completo (Excel SheetJS) */}
          <div className="bg-card border border-sand-border rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            style={{ background: "#FFFAF1" }}>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center font-bold text-lg">
                  📥
                </div>
                <div>
                  <h3 className="font-serif font-bold text-[#2A2418] text-base sm:text-lg">
                    Exportar Reservas Completo (Excel)
                  </h3>
                  <p className="text-xs text-muted">
                    Descarga la base de datos de reservas filtrada por estado en planilla `.xlsx`.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">
                  Filtrar por Estado
                </label>
                <select
                  value={estadoReservaExcel}
                  onChange={(e) => setEstadoReservaExcel(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sand-border bg-white text-xs text-ink outline-none"
                >
                  <option value="TODOS">Todas las Reservas</option>
                  <option value="CONFIRMADA">Solo Confirmadas</option>
                  <option value="PENDIENTE">Solo Pendientes</option>
                  <option value="FINALIZADA">Solo Finalizadas</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleExportTodasReservasExcel}
              className="w-full mt-6 bg-[#1EAD50] hover:bg-green-700 text-white font-semibold rounded-xl py-3 text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>📊 Exportar Reservas a Excel (.xlsx)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
