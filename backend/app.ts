import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "node:path";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import { createProjectRoutes, type Database } from "./routes/projectRoutes.js";
import { createProjectContentRoutes } from "./routes/projectContentRoutes.js";
import { createEmailRoutes, type SendMail } from "./routes/emailRoute.js";
import converterRoutes from "./routes/converterRoutes.js";
import pythonRoutes from "./routes/pythonRoutes.js";
import { initSockets, ZIP_POLICY } from "./sockets/socket.js";

export function createApplication(options: {
  database: Database;
  sendMail?: SendMail;
  production?: boolean;
  secret?: string;
  origin?: string;
  staticPath?: string;
  zipPolicy?: Partial<typeof ZIP_POLICY>;
}) {
  const production =
    options.production ?? process.env.NODE_ENV === "production";
  const secret = options.secret ?? process.env.JWT_SECRET ?? "dev";
  if (production && (secret === "dev" || secret.length < 32))
    throw new Error(
      "Production requires JWT_SECRET of at least 32 characters.",
    );
  const origin =
    options.origin ??
    process.env.CLIENT_ORIGIN ??
    (production ? "https://jovanstosic.dev" : "http://localhost:5174");
  if (production && !origin.startsWith("https://"))
    throw new Error(
      "Production CLIENT_ORIGIN must be your HTTPS website origin.",
    );
  const app = express();
  const trustedHops = Number(process.env.TRUST_PROXY_HOPS ?? 0);
  if (trustedHops > 0 && Number.isInteger(trustedHops))
    app.set("trust proxy", trustedHops);
  app.use(cors({ origin, credentials: true, methods: ["GET", "POST"] }));
  app.use(cookieParser());
  app.use(compression());
  app.use("/api", express.json({ limit: "64kb" }), (req, res, next) => {
    let clientID: string | undefined;
    try {
      const payload = jwt.verify(req.cookies.auth_token ?? "", secret);
      if (typeof payload === "object" && typeof payload.clientID === "string")
        clientID = payload.clientID;
    } catch {
      /* Invalid and expired tokens are assigned a new identity. */
    }
    if (!clientID) {
      clientID = randomBytes(16).toString("hex");
      res.cookie(
        "auth_token",
        jwt.sign({ clientID }, secret, { expiresIn: "2h" }),
        {
          httpOnly: true,
          secure: production,
          sameSite: "lax",
          maxAge: 2 * 60 * 60_000,
          path: "/",
        },
      );
    }
    req.clientID = clientID;
    next();
  });
  app.use(
    "/api",
    rateLimit({
      windowMs: 60_000,
      limit: 120,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: { message: "Too many requests. Please try again shortly." },
    }),
  );
  app.get("/api/session", (_req, res) =>
    res.json({ protocol: 2, maxFileBytes: 5 * 1024 * 1024 }),
  );
  app.use("/api/projects", createProjectRoutes(options.database));
  app.use("/api/project-content", createProjectContentRoutes(options.database));
  app.use("/api/email", createEmailRoutes(options.sendMail));
  app.use("/api/convert", converterRoutes);
  app.use("/api/python", pythonRoutes);
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "API endpoint not found" }),
  );
  if (production && options.staticPath) {
    app.use(express.static(options.staticPath));
    app.get(/.*/, (_req, res) =>
      res.sendFile(path.join(options.staticPath!, "index.html")),
    );
  }
  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number(error.status)
          : 500;
      res
        .status(status >= 400 && status < 500 ? status : 500)
        .json({
          message:
            status === 413
              ? "Request too large"
              : status === 400
                ? "Invalid request"
                : "Service unavailable. Please try again.",
        });
    },
  );
  const server = createServer(app);
  const io = new Server(server, {
    maxHttpBufferSize: 128 * 1024,
    cors: { origin, credentials: true },
    allowRequest: (req, done) =>
      done(null, !req.headers.origin || req.headers.origin === origin),
  });
  const configured: Partial<typeof ZIP_POLICY> = {};
  for (const key of Object.keys(ZIP_POLICY) as (keyof typeof ZIP_POLICY)[]) {
    const variable = `ZIP_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`;
    if (process.env[variable]) configured[key] = Number(process.env[variable]);
  }
  const zipline = initSockets(io, {
    secret,
    trustedHops,
    policy: { ...configured, ...options.zipPolicy },
  });
  return { app, server, io, zipline };
}
