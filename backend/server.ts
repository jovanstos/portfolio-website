import express from 'express'
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'path'
import { fileURLToPath } from "url";
import projectRoutes from "./routes/projectRoutes.js"
import projectContentRoutes from "./routes/projectContentRoutes.js"
import { initSockets } from './sockets/socket.js';
import rateLimit from 'express-rate-limit';

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDistPath = path.join(__dirname, "..", "dist");

app.use(express.static(clientDistPath));

app.use(
    '/api',
    rateLimit({
        windowMs: 60 * 1000,
        max: 60
    })
);

app.use("/api/projects", projectRoutes);

app.use("/api/project-content", projectContentRoutes);

app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

initSockets(io)

server.listen(3000, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});