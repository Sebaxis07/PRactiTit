const { Client } = require("pg");

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres.prlwimtuxgkqsdbgdomn:PensionMyriam2026%21@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
  });

  try {
    await client.connect();
    console.log("Conectado exitosamente a Supabase Postgres");

    await client.query(`
      ALTER TABLE "Reserva" ADD COLUMN IF NOT EXISTS "codigoReserva" TEXT;
      ALTER TABLE "Reserva" ADD COLUMN IF NOT EXISTS "solicitudCambio" TEXT;
      CREATE UNIQUE INDEX IF NOT EXISTS "Reserva_codigoReserva_key" ON "Reserva"("codigoReserva");
    `);

    console.log("SUCCESS: Columnas 'codigoReserva' y 'solicitudCambio' añadidas a la tabla Reserva.");
  } catch (error) {
    console.error("Error al alterar la tabla:", error);
  } finally {
    await client.end();
  }
}

main();
