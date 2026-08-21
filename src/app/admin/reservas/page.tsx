import { getAdminSession } from "@/features/auth/actions/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getTodasLasReservas } from "@/features/reservas/actions/admin-reservas";
import { getHabitacionesDisponibles } from "@/features/habitaciones/services/habitaciones";
import { AdminReservasView } from "@/features/reservas/components/AdminReservasView";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Gestión de Reservas · Pensión Señora Myriam",
  description: "Administración general de reservas y estados para la Sra. Myriam.",
};

export default async function AdminReservasPage() {
  const sessionUser = await getAdminSession();
  if (!sessionUser) {
    return <LoginForm />;
  }

  const reservas = await getTodasLasReservas();
  const habitaciones = await getHabitacionesDisponibles();

  return <AdminReservasView reservas={reservas} habitaciones={habitaciones} />;
}
