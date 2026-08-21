"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function GaleriaCarrusel() {
  const images = [
    { src: "/images/comedor.jpg", alt: "Comedor rústico de la pensión", title: "Comedor y Mesa Familiar" },
    { src: "/images/habitacion.jpg", alt: "Habitación privada acogedora", title: "Habitaciones Independientes" },
    { src: "/images/pasillo.jpg", alt: "Pasillo y descanso", title: "Tranquilidad y Privacidad" },
    { src: "/images/senora-myriam.jpg", alt: "Atención cálida de la Señora Myriam", title: "Hospitalidad de la Sra. Myriam" },
    { src: "/images/IMAGENES.JPG", alt: "Comida casera recién preparada", title: "Cocina Casera de Siempre" },
    { src: "/images/grupo-huespedes.jpg", alt: "Huéspedes en la pensión", title: "Ambiente Familiar" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Auto-play cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-card bg-card group aspect-[16/9] md:aspect-[21/9]">
      {/* Imagen activa */}
      <div className="relative w-full h-full">
        <Image
          src={images[currentIndex].src}
          alt={images[currentIndex].alt}
          fill
          className="object-cover transition-opacity duration-700"
          priority
        />
        {/* Sombra de degradado para texto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

        {/* Título de la Foto */}
        <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-sand-deep font-semibold bg-terracotta/80 px-3 py-1 rounded-full">
            Nuestra Casa en Paposo
          </span>
          <h3 className="font-serif font-bold text-lg md:text-2xl drop-shadow-md">
            {images[currentIndex].title}
          </h3>
        </div>
      </div>

      {/* Botón Anterior */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-terracotta text-white backdrop-blur-md grid place-items-center transition-all opacity-80 group-hover:opacity-100"
        aria-label="Anterior foto"
      >
        ❮
      </button>

      {/* Botón Siguiente */}
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-terracotta text-white backdrop-blur-md grid place-items-center transition-all opacity-80 group-hover:opacity-100"
        aria-label="Siguiente foto"
      >
        ❯
      </button>

      {/* Indicadores Puntos */}
      <div className="absolute bottom-3 right-6 flex gap-1.5 z-10">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? "bg-terracotta w-6" : "bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
