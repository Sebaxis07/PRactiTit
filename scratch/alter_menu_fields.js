const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.prlwimtuxgkqsdbgdomn:PensionMyriam2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
  });

  try {
    await client.connect();
    console.log("Conectado a Supabase Postgres");

    await client.query(`
      ALTER TABLE "MenuDiario"
      ADD COLUMN IF NOT EXISTS "horarioDesayuno" TEXT DEFAULT '08:00 - 09:30',
      ADD COLUMN IF NOT EXISTS "horarioAlmuerzo" TEXT DEFAULT '13:00 - 15:00',
      ADD COLUMN IF NOT EXISTS "horarioCena" TEXT DEFAULT '20:00 - 21:30',
      ADD COLUMN IF NOT EXISTS "desayunoImagen" TEXT,
      ADD COLUMN IF NOT EXISTS "desayunoDisponible" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "almuerzoOpcion1" TEXT,
      ADD COLUMN IF NOT EXISTS "almuerzoOpcion1Imagen" TEXT,
      ADD COLUMN IF NOT EXISTS "almuerzoOpcion1Disponible" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "almuerzoOpcion2" TEXT,
      ADD COLUMN IF NOT EXISTS "almuerzoOpcion2Imagen" TEXT,
      ADD COLUMN IF NOT EXISTS "almuerzoOpcion2Disponible" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "cenaOpcion1" TEXT,
      ADD COLUMN IF NOT EXISTS "cenaOpcion1Imagen" TEXT,
      ADD COLUMN IF NOT EXISTS "cenaOpcion1Disponible" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "cenaOpcion2" TEXT,
      ADD COLUMN IF NOT EXISTS "cenaOpcion2Imagen" TEXT,
      ADD COLUMN IF NOT EXISTS "cenaOpcion2Disponible" BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS "colacionImagen" TEXT,
      ADD COLUMN IF NOT EXISTS "colacionDisponible" BOOLEAN DEFAULT true;

      ALTER TABLE "ReservaServicio"
      ADD COLUMN IF NOT EXISTS "preferenciaAlmuerzo" TEXT,
      ADD COLUMN IF NOT EXISTS "preferenciaCena" TEXT,
      ADD COLUMN IF NOT EXISTS "renunciaDesayuno" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "renunciaAlmuerzo" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "renunciaCena" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "solicitudExtraNotas" TEXT;
    `);

    console.log("SUCCESS: Nuevos campos de horarios, switches de disponibilidad y preferencias agregados en Supabase PostgreSQL.");
  } catch (error) {
    console.error("Error al alterar la estructura de MenuDiario/ReservaServicio:", error);
  } finally {
    await client.end();
  }
}

main();
