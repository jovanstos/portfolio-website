import express from 'express'
import path from 'path'
import { fileURLToPath } from "url";
import projectRoutes from "./routes/projectRoutes.js"
import rateLimit from 'express-rate-limit';

const app = express();
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

app.use((req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});