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
import { initSockets } from "./sockets/socket.js";
import { signToken } from "./jwt/jwt.js";
import { nanoid } from 'nanoid';
import cookieParser from "cookie-parser";

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === "production";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || undefined;

const corsOptions = isProd
    ? { origin: false }
    : {
        origin: CLIENT_ORIGIN,
        credentials: true,
    };

const io = new Server(server, {
    cors: corsOptions,
});

app.use(cors(corsOptions));

app.use(cookieParser());

app.use((req, res, next) => {
    let token = req.cookies.auth_token;

    if (!token) {
        const newClientID = nanoid();

        token = signToken({ clientID: newClientID });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "strict" : "lax",
            // miliseconds * second * minutes * hours
            maxAge: 1000 * 30
        });

        console.log(`New client assigned: ${newClientID}`);
    }

    next();
});

app.use(express.json());

app.use(
    "/api",
    rateLimit({
        windowMs: 60 * 1000,
        max: 60,
    })
);

app.use("/api/projects", projectRoutes);
app.use("/api/project-content", projectContentRoutes);
app.use("/api/convert", converterRoutes);

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
