"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Forzar estado sólido si el menú móvil está abierto
  const isSolid = scrolled || isOpen;

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 px-4 sm:px-8 ${
        isSolid 
          ? "bg-[#f5ecd9] border-b border-[#ddd0b3] py-2.5 shadow-md" 
          : "bg-transparent border-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo de la Pensión */}
        <Link href="/" className="py-1 inline-flex items-center transition-transform duration-300 hover:scale-[1.02]">
          <Image
            src="/images/logo.png"
            alt="Pensión Señora Myriam"
            width={180}
            height={58}
            className={`w-auto object-contain transition-all duration-300 ${
              isSolid 
                ? "h-[46px] sm:h-[52px]" 
                : "h-[54px] sm:h-[62px] brightness-0 invert drop-shadow-md"
            }`}
            priority
          />
        </Link>

        {/* Links Desktop */}
        <div className={`hidden lg:flex items-center gap-6 text-sm font-semibold transition-colors duration-300 ${
          isSolid ? "text-ink/85" : "text-white drop-shadow-sm"
        }`}>
          <a href="/#nosotros" className="hover:text-terracotta transition-colors duration-200">Nosotros</a>
          <a href="/#habitaciones" className="hover:text-terracotta transition-colors duration-200">Habitaciones</a>
          <a href="/#alimentacion" className="hover:text-terracotta transition-colors duration-200">Comida</a>
          <a href="/#galeria" className="hover:text-terracotta transition-colors duration-200">Galería</a>
          <a href="/#testimonios" className="hover:text-terracotta transition-colors duration-200">Calificaciones</a>
          <Link href="/mi-reserva" className="text-terracotta font-bold hover:underline flex items-center gap-1 transition-transform hover:scale-105 duration-200">
            <span>🔑 Mi Reserva</span>
          </Link>
          <a href="/#contacto" className="hover:text-terracotta transition-colors duration-200">Contacto</a>
        </div>

        {/* Acción CTA de Reserva Web del Sistema */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/reservar"
            className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:scale-105 inline-flex items-center gap-2"
          >
            <span>📅 Reservar pieza</span>
          </Link>
        </div>

        {/* Botón Hamburger / Cerrar Móvil */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`lg:hidden p-2 rounded-full border transition-all duration-300 ${
            isSolid 
              ? "border-[#ddd0b3] text-ink hover:bg-sand-deep/40" 
              : "border-white/30 text-white hover:bg-white/10"
          }`}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Menú Desplegable Móvil (Integrado sin corte visual, continuo y fluido) */}
      {isOpen && (
        <div className="lg:hidden bg-[#f5ecd9] border-t border-[#ddd0b3]/50 mt-2.5 pt-4 pb-6 px-2 space-y-4 rounded-b-2xl shadow-xl animate-scale-in">
          <div className="flex flex-col gap-1 text-sm font-semibold text-ink">
            <a href="/#nosotros" onClick={() => setIsOpen(false)} className="hover:text-terracotta py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all">Nosotros</a>
            <a href="/#habitaciones" onClick={() => setIsOpen(false)} className="hover:text-terracotta py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all">Habitaciones</a>
            <a href="/#alimentacion" onClick={() => setIsOpen(false)} className="hover:text-terracotta py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all">Comida</a>
            <a href="/#galeria" onClick={() => setIsOpen(false)} className="hover:text-terracotta py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all">Galería</a>
            <a href="/#testimonios" onClick={() => setIsOpen(false)} className="hover:text-terracotta py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all">Calificaciones</a>
            <Link href="/mi-reserva" onClick={() => setIsOpen(false)} className="text-terracotta font-bold py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all flex items-center gap-1">🔑 Mi Reserva (Consultar)</Link>
            <a href="/#contacto" onClick={() => setIsOpen(false)} className="hover:text-terracotta py-2 px-3 rounded-xl hover:bg-sand-deep/20 transition-all">Contacto</a>
          </div>

          <div className="pt-3 border-t border-[#ddd0b3]/40 px-3">
            <Link
              href="/reservar"
              onClick={() => setIsOpen(false)}
              className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold text-center text-sm py-3 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <span>📅 Reservar pieza</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
