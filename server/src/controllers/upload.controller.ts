import { Request, Response } from "express";
import {
  successResponse,
  errorResponse,
} from "../utils/responses";

interface AuthRequest extends Request {
  user?: { id: number; role: string };
  file?: Express.Multer.File;
}

export const uploadThumbnail = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    if (req.user.role !== "ADMIN" && req.user.role !== "INSTRUCTOR") {
      return errorResponse(
        res,
        403,
        "Only instructors and administrators can upload thumbnails."
      );
    }

    if (!req.file) {
      return errorResponse(
        res,
        400,
        "No file uploaded. Use form field name: thumbnail."
      );
    }

    // Served by express.static at /uploads
    const publicUrl = `/uploads/${req.file.filename}`;

    return successResponse(res, 201, "Thumbnail uploaded.", {
      thumbnailUrl: publicUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("Upload thumbnail error:", error);
    return errorResponse(res, 500, "Failed to upload thumbnail.");
  }
};
