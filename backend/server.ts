import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import cors from "cors";
import projectRoutes from "./routes/projectRoutes.js";
import projectContentRoutes from "./routes/projectContentRoutes.js";
import converterRoutes from "./routes/converterRoutes.js";
import pythonRoutes from "./routes/pythonRoutes.js";
import emailRoutes from "./routes/emailRoute.js";
import { initSockets } from "./sockets/socket.js";
import { signToken, verifyToken } from "./jwt/jwt.js";
import { decode } from "jsonwebtoken";
import { nanoid } from "nanoid";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

// In Prod, the origin is the same, so we disable CORS (origin: false).
// In Dev, we need to allow the Vite/React localhost port.
const corsOptions = {
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST"],
};

let io;

if (isProd) {
  io = new Server(server, {
    pingTimeout: 60000,
  });
} else {
  io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60000,
  });
}

function setAuthCookie(res: any, token: string) {
  // Raw HTTP (no SSL), 'secure: true' will block cookies, so this accounts for that
  const isSecure = isProd && process.env.USE_HTTPS === "true";

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: isSecure,
    // If it's prod make sure the cookie is the backend URL, else make it lax
    sameSite: "lax",
    // miliseconds * second * minutes * hours
    maxAge: 1000 * 60 * 60 * 24,
  });
}

if (isProd) {
  app.set("trust proxy", 1);
}
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

// Handle the JWT short term token logic to have it so the client must be a verifed bowser to avoid API abuse
app.use((req, res, next) => {
  const token = req.cookies.auth_token;

  if (!token) {
    const clientID = nanoid();
    const newToken = signToken({ clientID });
    setAuthCookie(res, newToken);
    req.clientID = clientID;

    return next();
  }

  try {
    const payload = verifyToken(token) as { clientID: string; exp: number };
    req.clientID = payload.clientID;

    // Logic to check if only only a number of seconds are left so the token can be refreshed for real users
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp - now < 15) {
      const newToken = signToken({ clientID: payload.clientID });
      setAuthCookie(res, newToken);
    }

    return next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      const payload = decode(token) as { clientID: string };

      if (payload && payload.clientID) {
        const newToken = signToken({ clientID: payload.clientID });
        setAuthCookie(res, newToken);
        req.clientID = payload.clientID;
        return next();
      }
    }

    const clientID = nanoid();
    const newToken = signToken({ clientID });
    setAuthCookie(res, newToken);
    req.clientID = clientID;
    return next();
  }
});

// Rate limiter
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 60,
  }),
);

app.use("/api/projects", projectRoutes);
app.use("/api/project-content", projectContentRoutes);
app.use("/api/convert", converterRoutes);
app.use("/api/python", pythonRoutes);
app.use("/api/email", emailRoutes);

// How to run the site if it's production
if (isProd) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.join(__dirname, "..", "dist");

  app.use(express.static(clientDistPath));

  app.get(/^(.*)$/, (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

initSockets(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
