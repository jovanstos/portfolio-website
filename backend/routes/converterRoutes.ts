import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import rateLimit from "express-rate-limit";
import { requireAuth } from "./auth.js";
const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 1, fieldSize: 32 },
});
let active = 0;
router.post(
  "/",
  requireAuth,
  rateLimit({
    windowMs: 60_000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { message: "Too many conversions. Try again shortly." },
  }),
  (req, res, next) => {
    upload.single("image")(req, res, (error: unknown) => {
      if (error instanceof multer.MulterError)
        return res
          .status(error.code === "LIMIT_FILE_SIZE" ? 413 : 400)
          .json({
            message:
              error.code === "LIMIT_FILE_SIZE"
                ? "Image must be at most 5 MiB."
                : "Invalid image upload.",
          });
      if (error) return next(error);
      next();
    });
  },
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "Choose an image." });
    const format: unknown = req.body.outputFormat;
    if (
      typeof format !== "string" ||
      !["png", "jpg", "jpeg", "webp", "gif"].includes(format)
    )
      return res.status(400).json({ message: "Unsupported output format." });
    if (active >= 2)
      return res
        .status(503)
        .json({ message: "Converter is busy. Try again shortly." });
    active++;
    try {
      const image = sharp(req.file.buffer, {
        limitInputPixels: 25_000_000,
        failOn: "error",
      });
      const metadata = await image.metadata();
      if (
        !metadata.format ||
        !["png", "jpeg", "webp", "gif"].includes(metadata.format)
      )
        return res
          .status(400)
          .json({ message: "Use a PNG, JPEG, WebP, or GIF image." });
      const output =
        format === "jpg" ? "jpeg" : (format as "png" | "jpeg" | "webp" | "gif");
      const converted = await image.toFormat(output).toBuffer();
      return res
        .type(`image/${output}`)
        .set(
          "Content-Disposition",
          `attachment; filename="converted.${format}"`,
        )
        .send(converted);
    } catch {
      return res
        .status(400)
        .json({
          message:
            "Image could not be decoded. Use a valid image under 5 MiB and 25 megapixels.",
        });
    } finally {
      active--;
    }
  },
);
export default router;
