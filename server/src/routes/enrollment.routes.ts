import { Router } from "express";
import {
  enrollInCourse,
  getMyCourses,
} from "../controllers/enrollment.controller";
import {
  completeLesson,
  getCourseProgress,
} from "../controllers/progress.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/:courseId",
  authenticate,
  authorize("STUDENT"),
  enrollInCourse
);

router.get(
  "/my-courses",
  authenticate,
  authorize("STUDENT"),
  getMyCourses
);

router.post(
  "/:courseId/lessons/:lessonId/complete",
  authenticate,
  authorize("STUDENT"),
  completeLesson
);

router.get(
  "/:courseId/progress",
  authenticate,
  authorize("STUDENT"),
  getCourseProgress
);

export default router;
