import { getAdminSession } from "@/features/auth/actions/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getReportesDatos } from "@/features/reportes/services/reportes";
import { getTodasLasReservas } from "@/features/reservas/actions/admin-reservas";
import { AdminReportesView } from "@/features/reportes/components/AdminReportesView";
import { getAnalyticsData } from "@/features/dashboard/services/dashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reportes & Métricas · Pensión Señora Myriam",
  description: "Gráficos de ocupación, ingresos y exportación a PDF/Excel.",
};

export default async function AdminReportesPage() {
  const sessionUser = await getAdminSession();
  if (!sessionUser) {
    return <LoginForm />;
  }

  const reportes = await getReportesDatos();
  const reservas = await getTodasLasReservas();
  const analyticsData = await getAnalyticsData();

  return (
    <AdminReportesView
      reportes={reportes}
      reservas={reservas}
      distribucionIngresosData={analyticsData?.distribucionIngresosData}
      distribucionPagosData={analyticsData?.distribucionPagosData}
    />
  );
}
