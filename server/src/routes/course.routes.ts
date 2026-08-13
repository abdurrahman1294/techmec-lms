import { Router } from "express";

import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  getMyInstructorCourses,
} from "../controllers/course.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.get("/courses", getCourses);
router.get("/courses/:id", getCourseById);

router.post(
  "/courses",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  createCourse
);

router.put(
  "/courses/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  updateCourse
);

router.get(
  "/courses/:id/students",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  getCourseStudents
);

router.delete(
  "/courses/:id",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  deleteCourse
);

router.get(
  "/instructor/courses",
  authenticate,
  authorize("ADMIN", "INSTRUCTOR"),
  getMyInstructorCourses
);

export default router;

