import { Router, Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { requireAuth } from "./auth.js";
import { getUploader } from "./whitelist.js";

const router: Router = Router();

// Allowed formats for converting the image type
const ALLOWED_FORMATS = ["png", "jpg", "jpeg", "webp", "gif"] as const;
type OutputFormat = (typeof ALLOWED_FORMATS)[number];

// Handles the post request of taking the image and converting it to the requested format
router.post(
  "/",
  (req, res, next) => {
    const upload = getUploader(req);

    upload.single("image")(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            error: "Image too large.",
          });
        }
        return res.status(400).json({ error: err.message });
      }
      next(err);
    });
  },
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { outputFormat } = req.body as { outputFormat?: OutputFormat };

      if (!file) {
        return res.status(400).json({ error: "No image provided" });
      }

      if (!outputFormat || !ALLOWED_FORMATS.includes(outputFormat)) {
        return res.status(400).json({ error: "Invalid output format" });
      }

      const convertedBuffer = await sharp(file.buffer)
        .toFormat(outputFormat)
        .toBuffer();

      res.setHeader("Content-Type", `image/${outputFormat}`);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=converted.${outputFormat}`,
      );

      return res.send(convertedBuffer);
    } catch (error) {
      return res.status(500).json({ error: "Image conversion failed" });
    }
  },
);

export default router;
