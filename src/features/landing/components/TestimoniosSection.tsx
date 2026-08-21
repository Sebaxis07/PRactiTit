"use client";

import { formatDateCL } from "@/shared/utils/formatters";

interface CalificacionDTO {
  id: string;
  estrellas: number;
  comentario: string | null;
  nombreAutor: string;
  createdAt: Date;
  reserva: {
    cliente: {
      tipo: "TRABAJADOR_FAENA" | "TURISTA";
      empresa: string | null;
    };
  };
}

interface TestimoniosSectionProps {
  calificaciones?: CalificacionDTO[];
}

export function TestimoniosSection({ calificaciones = [] }: TestimoniosSectionProps) {
  // Testimonios estáticos de fallback
  const testimoniosEstaticos = [
    {
      nombre: "Esteban Morales",
      rol: "👷 Trabajador de Faena Minera",
      comentario:
        "La comida casera de la Señora Myriam es de otro nivel. Las viandas para la jornada de trabajo llegan calentitas, abundantes y con ese sabor de hogar que se agradece enormemente.",
      estrellas: 5,
      fecha: "Hace 2 semanas",
    },
    {
      nombre: "Maritza y Jorge",
      rol: "🌴 Turistas de Santiago",
      comentario:
        "Las piezas son totalmente independientes, limpias y muy tranquilas. Se duerme impecable escuchando la brisa del mar. La calidez y amabilidad de la Sra. Myriam no tiene precio.",
      estrellas: 5,
      fecha: "Hace 1 mes",
    },
    {
      nombre: "Roberto Silva",
      rol: "🏗️ Contratista Industrial",
      comentario:
        "Llevamos a nuestro equipo de trabajo a Paposo por 15 días y fue la mejor decisión. Excelente disposición, las colaciones impecables y el pan amasado al desayuno es un 10/10.",
      estrellas: 5,
      fecha: "Hace 3 semanas",
    },
  ];

  // Convertir calificaciones de BD a formato de la UI
  const testimoniosDinamicos = calificaciones.map((c) => {
    const esFaenero = c.reserva?.cliente?.tipo === "TRABAJADOR_FAENA";
    const empresa = c.reserva?.cliente?.empresa;
    
    return {
      nombre: c.nombreAutor,
      rol: esFaenero 
        ? `👷 Faenero · ${empresa || "Empresa Contratista"}`
        : "🌴 Turista / Particular",
      comentario: c.comentario || "Estadía muy recomendable en la pensión.",
      estrellas: c.estrellas,
      fecha: formatDateCL(new Date(c.createdAt)),
    };
  });

  // Combinar (dar prioridad a las dinámicas)
  const todosLosTestimonios = [...testimoniosDinamicos, ...testimoniosEstaticos].slice(0, 6);

  // Calcular promedio en base a valoraciones reales e históricas
  const totalDinamicas = calificaciones.length;
  const sumaEstrellas = calificaciones.reduce((acc, c) => acc + c.estrellas, 0);
  const promedioDinamico = totalDinamicas > 0 ? (sumaEstrellas / totalDinamicas).toFixed(1) : "4.9";
  const totalValoracionesStr = totalDinamicas > 0 ? `+${120 + totalDinamicas}` : "+120";

  return (
    <section className="py-20 px-4 sm:px-8 border-b border-sand-border/60" id="testimonios">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Rating Banner Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-card border border-sand-border rounded-3xl p-8 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
              <span className="w-6 h-[1px] bg-terracotta"></span>
              Opiniones de Huéspedes
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-ink">
              La experiencia de quienes nos visitan
            </h2>
            <p className="text-muted text-xs sm:text-sm">
              Trabajadores de faena, contratistas y turistas recomiendan la pensión.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-sand-deep/40 border border-sand-border rounded-2xl p-4 px-6 shrink-0 shadow-xs">
            <div className="flex text-amber-500 text-xl tracking-wider">
              {"★".repeat(Math.round(Number(promedioDinamico))) + "☆".repeat(5 - Math.round(Number(promedioDinamico)))}
            </div>
            <div className="font-serif font-bold text-2xl text-ink mt-1">{promedioDinamico} / 5.0</div>
            <div className="text-[10px] text-muted font-medium uppercase tracking-wider">
              Basado en {totalValoracionesStr} valoraciones
            </div>
          </div>
        </div>

        {/* Tarjetas de Testimonios / Comentarios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {todosLosTestimonios.map((t, idx) => (
            <div
              key={idx}
              className="bg-card border border-sand-border rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-terracotta/40 transition-all hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="text-amber-500 text-sm">
                    {"★".repeat(t.estrellas) + "☆".repeat(5 - t.estrellas)}
                  </div>
                  <span className="text-[10px] text-muted">{t.fecha}</span>
                </div>
                <p className="text-ink/80 text-xs sm:text-sm leading-relaxed italic">
                  “{t.comentario}”
                </p>
              </div>

              <div className="pt-3 border-t border-sand-border/60">
                <div className="font-bold font-serif text-ink text-sm">{t.nombre}</div>
                <div className="text-[11px] text-muted font-medium">{t.rol}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
