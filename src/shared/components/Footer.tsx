"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="w-full bg-ink text-sand pt-16 pb-12 px-4 sm:px-8 border-t border-sand-border/10 mt-auto">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Capa 1: Información del Negocio y Datos Clave */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Pensión Señora Myriam"
                width={140}
                height={46}
                className="brightness-0 invert opacity-90 h-9 w-auto object-contain"
              />
            </div>
            <p className="text-sand/70 text-xs leading-relaxed">
              Pensión Señora Myriam – Caleta Paposo, Región de Antofagasta. 
              Servicio familiar de hospedaje, alimentación casera y viandas para trabajadores de faena y turistas.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-terracotta">Contacto y Dirección</h4>
            <ul className="space-y-2 text-sand/65 text-xs">
              <li className="flex items-start gap-2">
                <span>📍</span>
                <span>Calle Principal S/N, Caleta Paposo, Comuna de Taltal, Región de Antofagasta</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📞</span>
                <a href="tel:+56940199049" className="hover:text-white transition-colors">+56 9 4019 9049</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:contacto@pensionmyriam.cl" className="hover:text-white transition-colors">contacto@pensionmyriam.cl</a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-serif font-bold text-sm text-terracotta">Horarios Referenciales</h4>
            <ul className="space-y-1 text-sand/65 text-xs">
              <li><span className="font-semibold text-sand/85">Check-in / Check-out:</span> Coordinado y flexible</li>
              <li><span className="font-semibold text-sand/85">Desayuno:</span> 08:00 – 09:30</li>
              <li><span className="font-semibold text-sand/85">Almuerzo:</span> 13:00 – 15:00</li>
              <li><span className="font-semibold text-sand/85">Cena:</span> 20:00 – 21:30</li>
            </ul>
          </div>
        </div>

        <hr className="border-sand-border/10" />

        {/* Capa 2: Enlaces Útiles e ingreso silencioso a la Admin */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs text-sand/70">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/#contacto" className="hover:text-white transition-colors">📍 Cómo llegar</a>
            <a href="/#alimentacion" className="hover:text-white transition-colors">🍽️ Ver menú casero</a>
            <a href="/reservar" className="font-bold text-terracotta hover:underline">📅 Reservar hospedaje</a>
            <a href="/terminos" className="hover:text-white transition-colors">📄 Términos y Condiciones</a>
            <a href="https://wa.me/56940199049?text=Hola%20Se%C3%B1ora%20Myriam,%20me%20gustar%C3%ADa%20consultar%20por%20disponibilidad" 
               target="_blank" 
               rel="noreferrer" 
               className="hover:text-white transition-colors">💬 WhatsApp directo</a>
          </div>

          <div>
            <a href="/admin" className="text-[10px] text-sand/40 hover:text-white/60 transition-colors">
              Acceso administración (solo personal)
            </a>
          </div>
        </div>

        <hr className="border-sand-border/10" />

        {/* Capa 3: Derechos de autor, créditos académicos e info legal */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-sand/50">
          <div className="text-center md:text-left space-y-1">
            <div>© {new Date().getFullYear()} Pensión Señora Myriam. Todos los derechos reservados.</div>
            <div className="text-[10px] opacity-75">Desarrollado como proyecto de título – Ingeniería Informática INACAP.</div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href="/terminos" className="hover:underline">Condiciones de reserva</a>
            <span className="opacity-30">|</span>
            <a href="/terminos#cocina" className="hover:underline">Políticas de cocina (4h)</a>
            <span className="opacity-30">|</span>
            <a href="/terminos#cookies" className="hover:underline">🍪 Política de cookies</a>
            <span className="opacity-30">|</span>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-cookie-settings"));
                }
              }}
              className="hover:underline cursor-pointer text-sand/70 hover:text-sand"
            >
              Preferencias de cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
