// Levanta la API (server.js) contra una instancia efímera de MongoDB
// (mongodb-memory-server) en lugar de MongoDB Atlas, y la siembra con
// server/seed.js. Pensado para correr Cypress localmente o en CI sin
// necesitar credenciales reales de Atlas.
//
// Uso:  node scripts/e2e-server.mjs
import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.resolve(__dirname, "..");

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri("destroyourself-e2e");

const env = {
  ...process.env,
  MONGO_URI: uri,
  JWT_SECRET: process.env.JWT_SECRET || "cypress-e2e-ephemeral-secret",
  PORT: process.env.PORT || "3001",
};

console.log(`[e2e-server] MongoDB efímero listo en ${uri}`);
console.log("[e2e-server] sembrando datos de prueba...");

await new Promise((resolve, reject) => {
  const seed = spawn(process.execPath, ["seed.js"], { cwd: serverDir, env, stdio: "inherit" });
  seed.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`seed.js salió con código ${code}`))));
});

console.log(`[e2e-server] iniciando la API en el puerto ${env.PORT}...`);
const serverProc = spawn(process.execPath, ["server.js"], { cwd: serverDir, env, stdio: "inherit" });

async function shutdown(code) {
  serverProc.kill();
  await mongod.stop();
  process.exit(code || 0);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
serverProc.on("exit", (code) => shutdown(code));
