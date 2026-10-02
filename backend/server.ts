import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./database/connection.js";
import { createApplication } from "./app.js";
const { server } = createApplication({
  database: pool,
  staticPath: path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../dist",
  ),
});
server.listen(Number(process.env.PORT ?? 3000), () =>
  console.log(`Server running on port ${process.env.PORT ?? 3000}`),
);
server.requestTimeout = 120_000;
server.headersTimeout = 30_000;
