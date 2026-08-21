import Image from "next/image";
import Link from "next/link";
import { formatCLP } from "@/shared/utils/formatters";
import { getHabitacionesDisponibles } from "@/features/habitaciones/services/habitaciones";
import { Navbar } from "@/shared/components/Navbar";
import { Footer } from "@/shared/components/Footer";
import { ScrollObserver } from "@/shared/components/ScrollObserver";
import { GaleriaCarrusel } from "@/features/landing/components/GaleriaCarrusel";
import { TestimoniosSection } from "@/features/landing/components/TestimoniosSection";
import { db } from "@/shared/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pensión Señora Myriam · Alojamiento y Comida Casera en Paposo",
  description: "Pensión familiar en Paposo, Región de Antofagasta. Habitaciones independientes, comida casera y la calidez del desierto costero.",
};

export default async function PublicHomePage() {
  const habitaciones = await getHabitacionesDisponibles();

  const calificaciones = await db.calificacion.findMany({
    where: { aprobado: true },
    include: {
      reserva: {
        include: {
          cliente: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  }) as any;

  return (
    <div className="min-h-screen bg-sand text-ink font-sans selection:bg-terracotta selection:text-white">
      {/* Scroll Reveal Observer */}
      <ScrollObserver />

      {/* Navbar Header */}
      <Navbar />

      {/* Hero Principal: Logo Grande a la Izquierda y Cuadro de Reserva a la Derecha */}
      <section className="relative min-h-[88vh] flex items-center justify-center pt-28 pb-16 px-4 sm:px-8 overflow-hidden" id="top">
        {/* Imagen de Fondo del Hero */}
        <Image
          src="/images/hero-paposo.jpg"
          alt="Paisaje del desierto costero de Paposo"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay en degradado */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/45 to-black/30"></div>

        {/* Transición difuminada en la base (degradado + desenfoque sutil) */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-sand via-sand/50 to-transparent backdrop-blur-[1px] pointer-events-none z-10"></div>

        {/* Layout de 2 Columnas (Logo Grande Izq vs Cuadro de Reserva Der) */}
        <div className="relative z-20 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Columna Izquierda: Logo Grande y Frase de Bienvenida */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left animate-fade-in-up" style={{ animationDelay: "100ms", opacity: 0 }}>
            <Image
              src="/images/logo-letra-blanca.png"
              alt="Pensión Señora Myriam"
              width={520}
              height={170}
              className="w-[75vw] max-w-[460px] mx-auto lg:mx-0 drop-shadow-2xl"
              priority
            />

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-serif text-white font-medium drop-shadow-md leading-tight">
              Tu descanso en el corazón de <em className="font-serif italic text-sand-deep">Paposo</em>
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-white/90 text-sm sm:text-base leading-relaxed drop-shadow-sm font-normal">
              Hospitalidad familiar, comida casera y la calma del desierto costero del norte de Chile.
            </p>

            <div className="text-xs uppercase tracking-[0.2em] text-white/80 pt-2 font-medium">
              Paposo · Región de Antofagasta · Chile
            </div>
          </div>

          {/* Columna Derecha: Cuadro Destacado "Aquí reserva tu habitación" */}
          <div className="lg:col-span-5 w-full animate-scale-in" style={{ animationDelay: "250ms", opacity: 0 }}>
            <div className="bg-card/95 backdrop-blur-md border border-sand-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-ink transition-all duration-300 hover:scale-[1.01] hover:shadow-3xl">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-terracotta bg-terracotta/10 px-3.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse"></span>
                  Sistema de Reservas en Línea
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink leading-snug">
                  Aquí reserva tu habitación
                </h2>
                <p className="text-muted text-xs sm:text-sm leading-relaxed">
                  Selecciona tus fechas de llegada, pieza independiente y plan de comida casera en minutos.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/reservar"
                  className="w-full bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full py-4 text-center text-sm sm:text-base shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <span>📅 Reservar pieza</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Sobre Nosotros */}
      <section className="py-20 px-4 sm:px-8 border-b border-sand-border/60" id="nosotros">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 reveal">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <span className="w-6 h-[1px] bg-terracotta"></span>
              Sobre Nosotros
            </div>

            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-ink leading-tight">
              Una casa familiar abierta al desierto.
            </h2>

            <p className="text-ink/80 text-sm sm:text-base leading-relaxed">
              La Pensión Señora Myriam es un lugar tranquilo y acogedor en Paposo, pensado para trabajadores de faena y visitantes que buscan descansar con comida casera y atención cálida.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 text-center">
              <div className="bg-card border border-sand-border rounded-2xl p-3.5 shadow-xs">
                <div className="font-serif font-bold text-xl text-terracotta">+15</div>
                <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Años hospedando</div>
              </div>
              <div className="bg-card border border-sand-border rounded-2xl p-3.5 shadow-xs">
                <div className="font-serif font-bold text-xl text-terracotta">100%</div>
                <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Cocina casera</div>
              </div>
              <div className="bg-card border border-sand-border rounded-2xl p-3.5 shadow-xs">
                <div className="font-serif font-bold text-xl text-terracotta">24/7</div>
                <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Atención cálida</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-card aspect-[4/3] reveal" style={{ transitionDelay: "150ms" }}>
            <Image
              src="/images/comedor.jpg"
              alt="Comedor rústico de la pensión"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* 2. Piezas Privadas (Habitaciones) */}
      <section className="py-20 px-4 sm:px-8 bg-sand-deep/40 border-b border-sand-border/60" id="habitaciones">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <span className="w-6 h-[1px] bg-terracotta"></span>
              Piezas Privadas
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
              Espacios independientes para descansar
            </h2>
            <p className="text-muted text-xs sm:text-sm">
              Habitaciones privadas con baño compartido impecable y mantas abrigadas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {habitaciones.map((h, idx) => (
              <div
                key={h.id}
                className="bg-card border border-sand-border rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-terracotta/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg reveal"
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-cactus/15 text-cactus px-2.5 py-1 rounded-full">
                    {h.estado}
                  </span>
                  <h3 className="font-serif font-bold text-ink text-lg mt-1">{h.numero}</h3>
                  <p className="text-xs text-muted">Capacidad: {h.capacidad} cama(s)</p>
                </div>

                <div className="pt-3 border-t border-sand-border/60 flex items-center justify-between">
                  <span className="text-xs text-muted">Desde</span>
                  <span className="font-serif font-bold text-terracotta text-sm">
                    {formatCLP(h.precioBase)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/reservar"
              className="bg-terracotta hover:bg-terracotta-deep text-white font-semibold rounded-full px-8 py-3.5 text-sm shadow-md transition-all hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <span>📅 Reservar pieza</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Comida Casera */}
      <section className="py-20 px-4 sm:px-8 border-b border-sand-border/60" id="alimentacion">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-card aspect-[4/3] reveal">
            <Image
              src="/images/IMAGENES.JPG"
              alt="Comida casera de la Señora Myriam"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-5 reveal" style={{ transitionDelay: "150ms" }}>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <span className="w-6 h-[1px] bg-terracotta"></span>
              Alimentación
            </div>

            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink leading-tight">
              La mesa de la Señora Myriam
            </h2>

            <p className="text-ink/80 text-sm sm:text-base leading-relaxed">
              Recetas tradicionales de hogar, porciones abundantes y colaciones/viandas preparadas especialmente para la jornada laboral en faena.
            </p>

            <div className="bg-card border border-sand-border rounded-2xl p-5 shadow-sm space-y-3 text-xs">
              <div className="flex justify-between items-center font-bold text-ink">
                <span>🥐 Desayuno Casero</span>
                <span className="text-terracotta">{formatCLP(4000)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-ink border-t border-sand-border/60 pt-2">
                <span>🍲 Almuerzo / Cena Tradicional</span>
                <span className="text-terracotta">{formatCLP(6000)} - {formatCLP(8000)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-ink border-t border-sand-border/60 pt-2">
                <span>🥪 Colación / Vianda para Faena</span>
                <span className="text-terracotta">{formatCLP(6000)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Galería (Carrusel Interactivo de Fotos) */}
      <section className="py-20 px-4 sm:px-8 border-b border-sand-border/60 bg-sand-deep/20" id="galeria">
        <div className="max-w-5xl mx-auto space-y-8 reveal">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <span className="w-6 h-[1px] bg-terracotta"></span>
              Galería de Fotos
            </div>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-ink">
              Un vistazo a nuestras instalaciones
            </h2>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Recorre nuestras instalaciones: comedores rústicos, piezas independientes y la calidez de la Sra. Myriam.
            </p>
          </div>

          {/* Carrusel de Fotos */}
          <GaleriaCarrusel />
        </div>
      </section>

      {/* 5. Calificaciones & Testimonios 5 Estrellas */}
      <div className="reveal">
        <TestimoniosSection calificaciones={calificaciones} />
      </div>

      {/* 6. Contacto & Ubicación */}
      <section className="py-20 px-4 sm:px-8" id="contacto">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5 reveal">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <span className="w-6 h-[1px] bg-terracotta"></span>
              Contacto Directo
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-ink">
              Escríbenos a WhatsApp
            </h2>

            <div className="space-y-3">
              <a
                href="https://wa.me/56940199049"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-4 bg-card border border-sand-border rounded-2xl shadow-xs hover:border-terracotta transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-terracotta text-white grid place-items-center font-bold text-lg">
                  💬
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted font-semibold">WhatsApp Directo</div>
                  <div className="font-serif font-bold text-ink text-base">+56 9 4019 9049</div>
                </div>
              </a>

              <div className="flex items-center gap-3 p-4 bg-card border border-sand-border rounded-2xl shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-sand-deep text-ink grid place-items-center font-bold text-lg">
                  📍
                </div>
                <div>
                  <div className="text-[10px] uppercase text-muted font-semibold">Ubicación</div>
                  <div className="font-serif font-bold text-ink text-sm">Caleta Paposo, Antofagasta, Chile</div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-sand-border shadow-lg h-[320px] reveal" style={{ transitionDelay: "150ms" }}>
            <iframe
              title="Mapa de Paposo"
              src="https://www.google.com/maps?q=Paposo,%20Antofagasta,%20Chile&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
