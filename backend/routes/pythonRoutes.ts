import { Router, Request, Response } from 'express';
import { requireAuth } from './auth.js';
import { compileUserCode } from '../utils/pythonRunner.js';

const router: Router = Router();

router.post('/compile', requireAuth, async (req: Request, res: Response) => {
    try {
        // Getting the code in the body
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "No code provided" });
        }

        // Runing the compiler logic
        const wasmBuffer = await compileUserCode(code);

        // Send the binary back
        res.setHeader('Content-Type', 'application/wasm');
        res.setHeader('Content-Disposition', 'attachment; filename="program.wasm"');
        res.send(wasmBuffer);

    } catch (error: any) {
        res.status(500).json({
            error: "Compilation Error",
            details: error.message
        });
    }
});

export default router;