import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;