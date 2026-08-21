import { getAdminSession } from "@/features/auth/actions/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getHabitacionesDisponibles } from "@/features/habitaciones/services/habitaciones";
import { AdminHabitacionesView } from "@/features/habitaciones/components/AdminHabitacionesView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Habitaciones · Pensión Señora Myriam",
  description: "Estado de piezas, capacidad y mantenimiento de habitaciones.",
};

export default async function AdminHabitacionesPage() {
  const sessionUser = await getAdminSession();
  if (!sessionUser) {
    return <LoginForm />;
  }

  const habitaciones = await getHabitacionesDisponibles();

  return <AdminHabitacionesView habitaciones={habitaciones} />;
}
