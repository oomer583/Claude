import { buildApp } from "./app.js";

const host = process.env.HOST ?? "0.0.0.0";
const parsedPort = Number.parseInt(process.env.PORT ?? "3001", 10);
const port = Number.isNaN(parsedPort) ? 3001 : parsedPort;
const app = buildApp();

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  app.log.info({ signal }, "Shutting down API");
  await app.close();
  process.exit(0);
};

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void shutdown(signal);
  });
}

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
