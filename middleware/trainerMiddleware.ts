import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";

const trainerMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.role !== "trainer") {
    res.status(403).json({
      success: false,
      message: "Trainer access required",
    });
    return;
  }

  next();
};

export default trainerMiddleware;