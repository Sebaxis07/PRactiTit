import { getHabitacionesDisponibles } from "@/features/habitaciones/services/habitaciones";
import { getFechasOcupadas } from "@/features/reservas/actions/reservas";
import { BookingForm } from "@/features/reservas/components/BookingForm";
import { Navbar } from "@/shared/components/Navbar";
import { Footer } from "@/shared/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Solicitar Reserva · Pensión Señora Myriam",
  description: "Solicita tu estadía en Paposo, Región de Antofagasta. Habitaciones independientes, comida casera y colaciones para faena.",
};

export default async function ReservarPage() {
  const habitaciones = await getHabitacionesDisponibles();
  const reservasExistentes = await getFechasOcupadas();

  return (
    <div className="min-h-screen bg-sand text-ink flex flex-col justify-between font-sans selection:bg-terracotta selection:text-white">
      {/* Navbar Header */}
      <Navbar />

      {/* Main Content de Ancho Completo (Full-width) */}
      <main className="w-full max-w-7xl mx-auto pt-28 pb-16 px-4 sm:px-8 space-y-8 flex flex-col items-center">
        <div className="text-center space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta bg-terracotta/10 px-4 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
            Sistema de Reservas en Línea
          </div>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-ink">
            Tu descanso en el corazón de Paposo
          </h1>
          <p className="text-muted text-xs sm:text-sm leading-relaxed">
            Selecciona tu rango de fechas en el calendario interactivo. Revisa días ocupados y disponibilidad en tiempo real.
          </p>
        </div>

        {/* Formulario de Reserva Interactivo Full-width */}
        <BookingForm habitaciones={habitaciones} reservasExistentes={reservasExistentes} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
