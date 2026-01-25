import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../jwt/jwt.js";

// This is used within all of the API requests to make sure the user has a valid auth token with JWT
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check if a clienID already exists since then the rest of this logic is unnessacry
    if ((req as any).clientID) {
        return next();
    }

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