-- CreateEnum
CREATE TYPE "EstadoHabitacion" AS ENUM ('DISPONIBLE', 'OCUPADA', 'MANTENIMIENTO', 'LIMPIEZA');

-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('TRABAJADOR_FAENA', 'TURISTA');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'FINALIZADA');

-- CreateTable
CREATE TABLE "Habitacion" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "precioBase" DECIMAL(65,30) NOT NULL,
    "estado" "EstadoHabitacion" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Habitacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "rutPasaporte" TEXT,
    "tipo" "TipoCliente" NOT NULL DEFAULT 'TURISTA',
    "empresa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reserva" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "habitacionId" TEXT NOT NULL,
    "fechaCheckIn" TIMESTAMP(3) NOT NULL,
    "fechaCheckOut" TIMESTAMP(3) NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservaServicio" (
    "id" TEXT NOT NULL,
    "reservaId" TEXT NOT NULL,
    "fechaServicio" TIMESTAMP(3) NOT NULL,
    "desayunosCant" INTEGER NOT NULL DEFAULT 0,
    "colacionesCant" INTEGER NOT NULL DEFAULT 0,
    "cenasCant" INTEGER NOT NULL DEFAULT 0,
    "restriccionDietaria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservaServicio_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_habitacionId_fkey" FOREIGN KEY ("habitacionId") REFERENCES "Habitacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReservaServicio" ADD CONSTRAINT "ReservaServicio_reservaId_fkey" FOREIGN KEY ("reservaId") REFERENCES "Reserva"("id") ON DELETE CASCADE ON UPDATE CASCADE;
