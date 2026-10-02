import type { Request, Response, NextFunction } from "express";
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.clientID) return next();
  return res
    .status(401)
    .json({ message: "Session unavailable. Please refresh." });
};
