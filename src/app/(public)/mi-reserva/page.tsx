import { GuestPortalView } from "@/features/reservas/components/GuestPortalView";
import { getMenuDiario } from "@/features/servicios-comida/actions/cocina";
import { Navbar } from "@/shared/components/Navbar";
import { Footer } from "@/shared/components/Footer";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mi Reserva · Portal del Huésped · Pensión Señora Myriam",
  description: "Consulta y gestiona tu reserva de hospedaje y alimentación en Paposo con tu código único.",
};

export default async function MiReservaPage() {
  const todayStr = new Date().toISOString().split("T")[0];
  const menuDiaGeneral = await getMenuDiario(todayStr);

  return (
    <div className="min-h-screen bg-sand text-ink flex flex-col justify-between font-sans selection:bg-terracotta selection:text-white">
      {/* Navbar Header */}
      <Navbar />

      {/* Main Content */}
      <main className="w-full max-w-7xl mx-auto pt-28 pb-16 px-4 sm:px-8 space-y-8 flex flex-col items-center">
        <GuestPortalView menuDiaGeneral={menuDiaGeneral} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
