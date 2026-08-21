/**
 * Formatea un número a moneda chilena CLP ($ 15.000)
 */
export function formatCLP(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Formatea una fecha al estándar legible en Chile (ej. "12 de Agosto, 2026")
 */
export function formatDateCL(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Retorna etiquetas y estilos de color según el estado de la reserva
 */
export function getEstadoReservaBadge(estado: string) {
  switch (estado) {
    case "CONFIRMADA":
      return { label: "Confirmada", className: "bg-cactus text-white" };
    case "PENDIENTE":
      return { label: "Pendiente", className: "bg-terracotta/20 text-terracotta border border-terracotta/40" };
    case "CANCELADA":
      return { label: "Cancelada", className: "bg-red-100 text-red-700 border border-red-200" };
    case "FINALIZADA":
      return { label: "Finalizada", className: "bg-sand-deep text-ink border border-sand-border" };
    default:
      return { label: estado, className: "bg-gray-100 text-gray-700" };
  }
}
