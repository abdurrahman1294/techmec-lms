import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";
import { thumbnailUpload } from "../middleware/upload.middleware";
import { uploadThumbnail } from "../controllers/upload.controller";

const router = Router();

function multerError(err: any, _req: Request, res: Response, next: NextFunction) {
  if (err) {
    const message =
      err.message || "Upload failed. Check file type and size (max 2MB).";
    return res.status(400).json({ success: false, message });
  }
  next();
}

router.post(
  "/upload/thumbnail",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  (req, res, next) => {
    thumbnailUpload.single("thumbnail")(req, res, (err) => {
      if (err) return multerError(err, req, res, next);
      next();
    });
  },
  uploadThumbnail
);

export default router;
