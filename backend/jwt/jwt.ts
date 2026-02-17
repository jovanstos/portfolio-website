import jwt, { SignOptions } from "jsonwebtoken";
import type { JwtPayload } from "../types/jwtTypes.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev";

// Simple but important logic in handling the JWT logic creating and verificaiton
export function signToken(
  payload: JwtPayload,
  options: SignOptions = { expiresIn: "15m" },
): string {
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
