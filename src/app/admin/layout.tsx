import { AdminSidebar } from "@/shared/components/AdminSidebar";
import { getAdminSession } from "@/features/auth/actions/auth";

export const metadata = {
  title: "Panel Administrativo · Pensión Señora Myriam",
  description: "Sistema de gestión y control diario de hospedaje y alimentación para la Sra. Myriam.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getAdminSession();

  if (!sessionUser) {
    return (
      <div className="min-h-screen text-ink font-sans selection:bg-terracotta selection:text-white"
        style={{ background: "#EDE8DF" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-ink font-sans flex flex-col lg:flex-row selection:bg-terracotta selection:text-white"
      style={{ background: "#EDE8DF" }}>
      {/* Sidebar Administrativo */}
      <AdminSidebar />

      {/* Area de Contenido Principal */}
      <div className="flex-1 overflow-y-auto min-h-screen"
        style={{ background: "#EDE8DF" }}>
        <div className="p-5 sm:p-8 md:p-10 max-w-screen-2xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
