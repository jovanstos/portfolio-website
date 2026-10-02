import { Router } from "express";
import nodemailer, { type SendMailOptions } from "nodemailer";
import rateLimit from "express-rate-limit";
import { validateContact } from "../shared/contact.js";
export type SendMail = (mail: SendMailOptions) => Promise<unknown>;
export function createEmailRoutes(sendMail?: SendMail) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 30_000,
    disableFileAccess: true,
    disableUrlAccess: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  const deliver = sendMail ?? ((mail) => transporter.sendMail(mail));
  const router = Router();
  router.post(
    "/",
    rateLimit({
      windowMs: 15 * 60_000,
      limit: 5,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: {
        message: "Too many messages. Please try later or email me directly.",
      },
    }),
    async (req, res) => {
      const result = validateContact(req.body);
      if (result.error || !result.data)
        return res.status(400).json({ message: result.error });
      if (!result.data.company) {
        const { name, email, subject, message } = result.data;
        try {
          await deliver({
            from: `Portfolio Contact <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email,
            subject: `[Contact Form] ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
          });
        } catch {
          return res
            .status(503)
            .json({
              message:
                "Email is unavailable. Please try later or email me directly.",
            });
        }
      }
      return res.json({ success: true });
    },
  );
  return router;
}
