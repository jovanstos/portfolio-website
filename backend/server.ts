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
import { initSockets } from "./sockets/socket.js";
import { signToken, verifyToken } from "./jwt/jwt.js";
import { decode } from "jsonwebtoken";
import { nanoid } from "nanoid";
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || undefined;

// Handle the cors option if the app is in production or not...
// ... this is used so dev tools can be used with vite and nodemon
const corsOptions = isProd
  ? { origin: false }
  : {
      origin: CLIENT_ORIGIN,
      credentials: true,
    };

const io = new Server(server, {
  cors: corsOptions,
});

function setAuthCookie(res: any, token: string) {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // If it's prod make sure the cookie is the backend URL, else make it lax
    sameSite: isProd ? undefined : "lax",
    // miliseconds * second * minutes * hours
    maxAge: 1000 * 60 * 60 * 24,
  });
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
    if (payload.exp - now < 10) {
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

// How to run the site if it's production
if (isProd) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientDistPath = path.join(__dirname, "..", "dist");

  app.use(express.static(clientDistPath));

  app.get("*", (_, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

initSockets(io);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
