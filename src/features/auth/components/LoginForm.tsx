"use client";

import { useState } from "react";
import Image from "next/image";
import { loginAdminAction } from "../actions/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const result = await loginAdminAction(email, password);

    if (result.success) {
      router.refresh();
    } else {
      setIsLoading(false);
      setErrorMessage(
        result.error === "Invalid login credentials"
          ? "Credenciales incorrectas. Verifica el correo y la contraseña."
          : result.error || "Ocurrió un error al iniciar sesión."
      );
    }
  };

  return (
    <div className="min-h-screen bg-sand text-ink flex items-center justify-center p-4 font-sans selection:bg-terracotta selection:text-white">
      <div className="w-full max-w-md bg-card border border-sand-border rounded-3xl p-8 shadow-2xl space-y-6">
        {/* Header con Logo */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-terracotta text-white font-serif font-bold grid place-items-center text-2xl shadow-lg mx-auto">
            M
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-ink">
              Acceso Administrativo
            </h1>
            <p className="text-muted text-xs mt-1">
              Panel de Gestión · Pensión Señora Myriam (Paposo)
            </p>
          </div>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pensionmyriam.cl"
              className="w-full p-3.5 rounded-xl border border-sand-border bg-white text-ink text-sm focus:ring-2 focus:ring-terracotta outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full p-3.5 rounded-xl border border-sand-border bg-white text-ink text-sm focus:ring-2 focus:ring-terracotta outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full py-3.5 text-sm shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 mt-2"
          >
            {isLoading ? "Validando credenciales..." : "🔒 Iniciar Sesión en Panel Admin"}
          </button>
        </form>

        <div className="pt-4 border-t border-sand-border/60 text-center text-xs text-muted">
          <span>Pensión Señora Myriam</span>
        </div>
      </div>
    </div>
  );
}
