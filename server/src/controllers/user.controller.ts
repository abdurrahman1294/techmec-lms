import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import {
  successResponse,
  errorResponse,
} from "../utils/responses";
import { passwordRegex } from "../utils/validators";
import { writeSystemLog } from "../utils/systemLog";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

const appRoleFromDbRole = (role: string) => {
  if (role === "ADMINISTRATOR") return "ADMIN";
  return role;
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            courses: true,
            enrollments: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    return successResponse(res, 200, "Profile retrieved.", {
      ...user,
      role: appRoleFromDbRole(user.role),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, 500, "Failed to load profile.");
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const name = String(req.body.name ?? "").trim();
    if (!name || name.length < 2) {
      return errorResponse(res, 400, "Name must be at least 2 characters.");
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return successResponse(res, 200, "Profile updated.", {
      ...user,
      role: appRoleFromDbRole(user.role),
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, 500, "Failed to update profile.");
  }
};

/** PUT /api/profile/password */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const currentPassword = String(req.body.currentPassword ?? "");
    const newPassword = String(req.body.newPassword ?? "");

    if (!currentPassword || !newPassword) {
      return errorResponse(
        res,
        400,
        "Current password and new password are required."
      );
    }

    if (!passwordRegex.test(newPassword)) {
      return errorResponse(
        res,
        400,
        "New password must be at least 8 characters and include upper, lower, number, and special character."
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return errorResponse(res, 401, "Current password is incorrect.");
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    await writeSystemLog("PASSWORD_CHANGED", {
      userId: req.user.id,
      details: "User changed password",
    });

    return successResponse(res, 200, "Password changed successfully.");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(res, 500, "Failed to change password.");
  }
};
