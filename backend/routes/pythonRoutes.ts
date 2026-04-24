import { Router, Request, Response } from "express";
import { requireAuth } from "./auth.js";
import { compileUserCode, runPIMClassifier } from "../utils/pythonRunner.js";

const router: Router = Router();

router.post("/compile", requireAuth, async (req: Request, res: Response) => {
  try {
    // Getting the code in the body
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "No code provided" });
    }

    // Runing the compiler logic
    const wasmBuffer = await compileUserCode(code);

    // Send the binary back
    res.setHeader("Content-Type", "application/wasm");
    res.setHeader("Content-Disposition", 'attachment; filename="program.wasm"');
    res.send(wasmBuffer);
  } catch (error: any) {
    res.status(500).json({
      error: "Compilation Error",
      details: error.message,
    });
  }
});

router.post("/pim", requireAuth, async (req: Request, res: Response) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ error: "No data provided" });
    }

    if (!Array.isArray(data[0]) || data[0].length !== 8) {
      return res.status(400).json({ error: "Invalid data format: expected array of 8-feature vectors" });
    }

    const prediction = await runPIMClassifier(data);
    res.send(prediction[0]);
  } catch (error: any) {
    res.status(500).json({
      error: "Model Error",
      details: error.message,
    });
  }
});

export default router;
