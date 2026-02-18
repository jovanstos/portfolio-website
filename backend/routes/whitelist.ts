import { pool } from "../database/connection.js";
import multer from "multer";
import { Request } from "express";

// Limits
export const MAX_SIZE_STANDARD = 10 * 1024 * 1024; // 10 MB
export const MAX_SIZE_VIP = 500 * 1024 * 1024; // 500 MB

// Whitelist
const query = `
SELECT
whitelist.ip
FROM whitelist
`;
const { rows } = await pool.query(query);
const WHITELISTED_IPS = rows.map((row) => row.ip);

// Two distinct Multer instances one for each type
const storage = multer.memoryStorage();

const uploadStandard = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE_STANDARD },
});

const uploadVip = multer({
  storage: storage,
  limits: { fileSize: MAX_SIZE_VIP },
});

// Helper to check IP
export const isIpWhitelisted = (ip: string | undefined): boolean => {
  if (!ip) return false;
  console.log("IP ATTEMPTING TO WHITELIST:", ip);
  // Handle standard IPv4 '::ffff:127.0.0.1' format
  const cleanIp = ip.replace("::ffff:", "");
  return WHITELISTED_IPS.includes(cleanIp);
};

// Selector function
export const getUploader = (req: Request) => {
  return isIpWhitelisted(req.ip) ? uploadVip : uploadStandard;
};
