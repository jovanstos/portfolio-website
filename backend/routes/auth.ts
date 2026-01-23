import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../jwt/jwt.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const payload = verifyToken(token);
        (req as any).clientID = payload.clientID;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Unauthorized" });
    }
};