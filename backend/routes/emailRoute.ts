import { Router, Request, Response } from "express";
import nodemailer from "nodemailer";

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const router = Router();

// Validation helper, matchs frontend regex
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body as ContactPayload;

    // Backend Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    if (!isValidEmail(email)) {
      res.status(400).json({ message: "Invalid email address." });
      return;
    }

    if (message.length < 10) {
      res.status(400).json({ message: "Message is too short." });
      return;
    }

    // Configure Nodemailer with Gmail
    // Note: "App Password" for Gmail, not login password. That would be bad.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Construct the email
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`, // Sender address is mine
      to: process.env.GMAIL_USER, // Sending to me
      replyTo: email, // Hitting "Reply" will reply to the visitor
      subject: `[Contact Form] ${subject}`,
      text: `
        You have a new message from your portfolio-website:
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
        
        -------------------------
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <br/>
        <p><strong>Message:</strong></p>
        <blockquote style="background: #f9f9f9; padding: 10px; border-left: 5px solid #ccc;">
          ${message.replace(/\n/g, "<br>")}
        </blockquote>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Contact API Error:", error);
    res.status(500).json({
      message: "Failed to send email. Please try again later.",
    });
  }
});

export default router;
