import { getAdminSession } from "@/features/auth/actions/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AdminConfiguracionView } from "@/features/configuracion/components/AdminConfiguracionView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Configuración · Pensión Señora Myriam",
  description: "Ajustes de perfil, precios de alimentación y datos de la pensión.",
};

export default async function AdminConfiguracionPage() {
  const sessionUser = await getAdminSession();
  if (!sessionUser) {
    return <LoginForm />;
  }

  return <AdminConfiguracionView />;
}
