"use server";

import { createServerSupabaseClient } from "@/shared/lib/supabase-server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// Credenciales de administrador autorizadas (fallback cuando Supabase Auth no está disponible)
const ADMIN_CREDENTIALS = [
  { email: "admin@example.com", password: "Dpastora2" },
  { email: "admin@pensionmyriam.cl", password: "PensionMyriam2026!" },
];

async function setAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "true", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/admin");
}

function isHardcodedAdmin(email: string, password: string): boolean {
  return ADMIN_CREDENTIALS.some(
    (c) => c.email === email && c.password === password
  );
}

export async function loginAdminAction(email: string, password: string) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Verificar credenciales hardcodeadas PRIMERO (siempre disponible)
  if (isHardcodedAdmin(cleanEmail, cleanPassword)) {
    await setAdminCookie();
    return { success: true, user: { email: cleanEmail } };
  }

  // 2. Intentar autenticar con Supabase Auth (si está configurado)
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (!error && data?.user) {
      await setAdminCookie();
      return { success: true, user: data.user };
    }
  } catch {
    // Supabase no está disponible, ya verificamos el fallback arriba
  }

  return {
    success: false,
    error: "Credenciales incorrectas. Verifica el correo y la contraseña.",
  };
}


export async function logoutAdminAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
  }
  revalidatePath("/admin");
  return { success: true };
}

export async function getAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("admin_session");
    if (adminCookie?.value === "true") {
      return { email: "admin@pensionmyriam.cl" };
    }

    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get("admin_session");
    if (adminCookie?.value === "true") {
      return { email: "admin@pensionmyriam.cl" };
    }
    return null;
  }
}
