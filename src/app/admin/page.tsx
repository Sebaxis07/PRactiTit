import { getAdminSession } from "@/features/auth/actions/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import {
  getDashboardKPIs,
  getProximosCheckIns,
  getSolicitudesPendientes,
  getAnalyticsData,
} from "@/features/dashboard/services/dashboard";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard Inicio · Pensión Señora Myriam",
  description: "Panel de control diario y métricas en tiempo real para la Sra. Myriam.",
};

export default async function AdminHomePage() {
  const sessionUser = await getAdminSession();

  if (!sessionUser) {
    return <LoginForm />;
  }

  const kpis = await getDashboardKPIs();
  const proximosCheckIns = await getProximosCheckIns();
  const solicitudes = await getSolicitudesPendientes();
  const analyticsData = await getAnalyticsData();

  return (
    <AdminDashboard
      kpis={kpis}
      proximosCheckIns={proximosCheckIns}
      solicitudesPendientes={solicitudes}
      analyticsData={analyticsData}
    />
  );
}
