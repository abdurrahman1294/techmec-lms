import { Request, Response } from "express";
import prisma from "../lib/prisma";
import {
  successResponse,
  errorResponse,
} from "../utils/responses";
import { writeSystemLog } from "../utils/systemLog";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

/**
 * POST /api/enrollments/:courseId/lessons/:lessonId/complete
 * Marks a lesson complete and recalculates progressPercent.
 */
export const completeLesson = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const courseId = Number(req.params.courseId);
    const lessonId = Number(req.params.lessonId);

    if (Number.isNaN(courseId) || Number.isNaN(lessonId)) {
      return errorResponse(res, 400, "Invalid course or lesson ID.");
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return errorResponse(
        res,
        403,
        "You are not enrolled in this course."
      );
    }

    const lesson = await prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });

    if (!lesson) {
      return errorResponse(
        res,
        404,
        "Lesson not found in this course."
      );
    }

    const completed = Array.isArray(enrollment.completedLessons)
      ? [...enrollment.completedLessons]
      : [];

    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
    }

    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    });

    const progressPercent =
      totalLessons === 0
        ? 0
        : Math.round((completed.length / totalLessons) * 100);

    const updated = await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        completedLessons: completed,
        progressPercent,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    });

    await writeSystemLog("LESSON_COMPLETED", {
      userId: req.user.id,
      details: `Lesson ${lessonId} in course ${courseId}; progress=${progressPercent}%`,
    });

    return successResponse(
      res,
      200,
      "Lesson marked complete.",
      updated
    );
  } catch (error) {
    console.error("Complete lesson error:", error);
    return errorResponse(res, 500, "Failed to update progress.");
  }
};

/**
 * GET /api/enrollments/:courseId/progress
 * Returns the student's progress for a course (including lesson list + completed).
 */
export const getCourseProgress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const courseId = Number(req.params.courseId);
    if (Number.isNaN(courseId)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.id,
          courseId,
        },
      },
    });

    if (!enrollment) {
      return errorResponse(
        res,
        403,
        "You are not enrolled in this course."
      );
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: "asc" },
    });

    return successResponse(res, 200, "Progress retrieved.", {
      enrollment,
      lessons,
      completedLessons: enrollment.completedLessons,
      progressPercent: enrollment.progressPercent,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return errorResponse(res, 500, "Failed to load progress.");
  }
};
