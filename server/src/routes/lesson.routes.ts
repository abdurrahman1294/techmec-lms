import { Router, Request, Response, NextFunction } from "express";

import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lesson.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

/** If Bearer token present, run full authenticate; otherwise continue anonymously. */
const optionalAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next();
  }
  return authenticate(req as any, res, next);
};

// Titles for everyone; content only if authorized (controller enforces)
router.get(
  "/courses/:courseId/lessons",
  optionalAuthenticate,
  getLessonsByCourse
);

// Full lesson content requires authentication (+ enrollment/ownership check)
router.get(
  "/lessons/:id",
  authenticate,
  getLessonById
);

router.post(
  "/courses/:courseId/lessons",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  createLesson
);

router.put(
  "/lessons/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  updateLesson
);

router.delete(
  "/lessons/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  deleteLesson
);

export default router;
