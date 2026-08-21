import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando sembrado (seed) de datos en Supabase...");

  // Limpieza inicial opcional de habitaciones de prueba si no hay reservas
  const count = await prisma.habitacion.count();
  if (count === 0) {
    await prisma.habitacion.createMany({
      data: [
        {
          numero: "Pieza 1 — Vista Mar",
          capacidad: 2,
          precioBase: 25000,
          estado: "DISPONIBLE",
        },
        {
          numero: "Pieza 2 — Familiar",
          capacidad: 4,
          precioBase: 40000,
          estado: "DISPONIBLE",
        },
        {
          numero: "Pieza 3 — Ejecutiva Faena",
          capacidad: 1,
          precioBase: 30000,
          estado: "DISPONIBLE",
        },
        {
          numero: "Pieza 4 — Doble Paposo",
          capacidad: 2,
          precioBase: 28000,
          estado: "DISPONIBLE",
        },
      ],
    });
    console.log("✅ 4 Habitaciones iniciales creadas en Supabase.");
  } else {
    console.log(`ℹ️ La base de datos ya cuenta con ${count} habitación(es).`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
