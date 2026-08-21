import { getAdminSession } from "@/features/auth/actions/auth";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { getPlanificadorCocina } from "@/features/servicios-comida/services/cocina";
import { getMenuDiario } from "@/features/servicios-comida/actions/cocina";
import { CocinaView } from "@/features/servicios-comida/components/CocinaView";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Planificador de Cocina · Pensión Señora Myriam",
  description: "Control diario de raciones, desayunos, colaciones de faena y cenas.",
};

export default async function AdminCocinaPage() {
  const sessionUser = await getAdminSession();
  if (!sessionUser) {
    return <LoginForm />;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const planificador = await getPlanificadorCocina();
  const menuInicial = await getMenuDiario(todayStr);

  return (
    <div className="min-h-screen bg-sand text-ink p-4 sm:p-8 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 pb-4 border-b border-sand-border/60">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-terracotta text-white font-serif font-bold grid place-items-center text-lg shadow-md">
            M
          </div>
          <div>
            <div className="font-serif font-bold text-lg text-ink">Módulo de Cocina</div>
            <div className="text-xs text-muted">Pensión Señora Myriam · Paposo</div>
          </div>
        </Link>
      </header>

      <main className="max-w-6xl mx-auto">
        <CocinaView planificador={planificador} menuInicial={menuInicial} />
      </main>
    </div>
  );
}
