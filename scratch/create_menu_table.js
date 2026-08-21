const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.prlwimtuxgkqsdbgdomn:PensionMyriam2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
  });

  try {
    await client.connect();
    console.log("Conectado a Supabase Postgres");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "MenuDiario" (
        "id" TEXT NOT NULL,
        "fecha" TIMESTAMP(3) NOT NULL,
        "desayunoTexto" TEXT,
        "almuerzoTexto" TEXT,
        "cenaTexto" TEXT,
        "colacionTexto" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MenuDiario_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "MenuDiario_fecha_key" ON "MenuDiario"("fecha");
    `);

    console.log("SUCCESS: Tabla MenuDiario creada exitosamente en Supabase PostgreSQL.");
  } catch (error) {
    console.error("Error al crear la tabla MenuDiario:", error);
  } finally {
    await client.end();
  }
}

main();
