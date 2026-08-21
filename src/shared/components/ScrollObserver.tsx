"use client";

import { useEffect } from "react";

export function ScrollObserver() {
  useEffect(() => {
    // Si no está en el navegador, salir
    if (typeof window === "undefined") return;

    // Crear el observador
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            // Dejar de observar una vez revelado para evitar animar múltiples veces
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08, // Revelar cuando el 8% del elemento entra en el viewport
        rootMargin: "0px 0px -40px 0px", // Margen sutil en la base
      }
    );

    // Buscar y registrar los elementos con clase reveal
    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    // Cleanup al desmontar
    return () => observer.disconnect();
  }, []);

  return null; // Componente silencioso sin markup
}
