import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      id: number;
      role: string;
    };

    // Reject suspended accounts on every protected request
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { status: true, role: true },
    });

    if (!dbUser) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (dbUser.status === "SUSPENDED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended.",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
