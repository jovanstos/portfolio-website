import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import type { JwtPayload } from "../types/jwtTypes.js"

const JWT_SECRET = process.env.JWT_SECRET || "dev"

export function signToken(
    payload: JwtPayload,
    options: SignOptions = { expiresIn: "40s" }
): string {
    return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}