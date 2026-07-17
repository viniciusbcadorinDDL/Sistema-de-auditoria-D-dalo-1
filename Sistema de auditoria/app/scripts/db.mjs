// Postgres LOCAL e portátil (sem Docker) para desenvolvimento.
// Os dados ficam em ./.postgres-data (ignorado pelo git).
//
//   npm run db:start   → sobe o banco em localhost:5433 e MANTÉM rodando
//                        (deixe este terminal aberto; Ctrl+C para parar)
//
// A primeira execução inicializa o cluster; as seguintes só sobem.
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";

const DATA_DIR = "./.postgres-data";
const DB_NAME = "dedalo";
const PORT = 5433;

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

if (!existsSync(DATA_DIR)) {
  console.log("→ Inicializando cluster Postgres local (primeira vez)...");
  await pg.initialise();
}

await pg.start();
try {
  await pg.createDatabase(DB_NAME);
  console.log(`→ Banco '${DB_NAME}' criado.`);
} catch {
  console.log(`→ Banco '${DB_NAME}' já existe.`);
}

console.log(
  `\n✓ Postgres rodando em postgresql://postgres:postgres@localhost:${PORT}/${DB_NAME}`,
);
console.log("  Deixe este terminal aberto. Pressione Ctrl+C para parar.\n");

async function shutdown() {
  console.log("\n→ Parando Postgres...");
  try {
    await pg.stop();
  } catch {
    // ignora erros ao parar
  }
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Mantém o processo (e o servidor) vivo.
await new Promise(() => {});
