
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

export const createLesson = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Unauthorized."
      );
    }

    const courseId = Number(
      req.params.courseId
    );

    const {
      title,
      content,
    } = req.body;

    if (Number.isNaN(courseId)) {
      return errorResponse(
        res,
        400,
        "Invalid course ID."
      );
    }

    if (!title || !content) {
      return errorResponse(
        res,
        400,
        "Lesson title and content are required."
      );
    }

    const course =
      await prisma.course.findUnique({
        where: {
          id: courseId,
        },
      });

    if (!course) {
      return errorResponse(
        res,
        404,
        "Course not found."
      );
    }

    const isAdmin =
      req.user.role === "ADMIN";

    const isOwner =
      course.instructorId ===
      req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        403,
        "You can only add lessons to your own courses."
      );
    }

    const lastLesson =
      await prisma.lesson.findFirst({
        where: {
          courseId,
        },
        orderBy: {
          sortOrder: "desc",
        },
      });

    const sortOrder =
      lastLesson
        ? lastLesson.sortOrder + 1
        : 1;

    const lesson =
      await prisma.lesson.create({
        data: {
          title,
          content,
          courseId,
          sortOrder,
        },
      });

    await writeSystemLog("LESSON_CREATED", {
      userId: req.user.id,
      details: `Lesson ${lesson.id} course ${courseId}`,
    });

    return successResponse(
      res,
      201,
      "Lesson created successfully.",
      lesson
    );
  } catch (error) {
    console.error(
      "Create lesson error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to create lesson."
    );
  }
};

/**
 * GET /courses/:courseId/lessons
 * - Unauthenticated / unenrolled: titles + sortOrder only (no content)
 * - Enrolled student / instructor owner / admin: full content
 */
export const getLessonsByCourse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const courseId = Number(req.params.courseId);

    if (Number.isNaN(courseId)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    let canViewContent = false;
    if (req.user) {
      if (req.user.role === "ADMIN") {
        canViewContent = true;
      } else if (
        req.user.role === "INSTRUCTOR" &&
        course.instructorId === req.user.id
      ) {
        canViewContent = true;
      } else if (req.user.role === "STUDENT") {
        const enrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: req.user.id,
              courseId,
            },
          },
        });
        canViewContent = !!enrollment;
      }
    }

    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      orderBy: { sortOrder: "asc" },
      select: canViewContent
        ? {
            id: true,
            courseId: true,
            title: true,
            content: true,
            sortOrder: true,
            createdAt: true,
          }
        : {
            id: true,
            courseId: true,
            title: true,
            sortOrder: true,
            createdAt: true,
          },
    });

    return successResponse(
      res,
      200,
      "Lessons retrieved successfully.",
      lessons
    );
  } catch (error) {
    console.error("Get lessons error:", error);
    return errorResponse(res, 500, "Failed to fetch lessons.");
  }
};

/**
 * GET /lessons/:id
 * Full content only for admin, course instructor, or enrolled student.
 */
export const getLessonById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Authentication required to view lesson content."
      );
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return errorResponse(res, 400, "Invalid lesson ID.");
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!lesson) {
      return errorResponse(res, 404, "Lesson not found.");
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner =
      lesson.course.instructorId === req.user.id;

    let isEnrolled = false;
    if (req.user.role === "STUDENT") {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: req.user.id,
            courseId: lesson.courseId,
          },
        },
      });
      isEnrolled = !!enrollment;
    }

    if (!isAdmin && !isOwner && !isEnrolled) {
      return errorResponse(
        res,
        403,
        "You do not have access to this lesson content."
      );
    }

    const { course, ...lessonData } = lesson;
    return successResponse(
      res,
      200,
      "Lesson retrieved successfully.",
      lessonData
    );
  } catch (error) {
    console.error("Get lesson error:", error);
    return errorResponse(res, 500, "Failed to fetch lesson.");
  }
};

export const updateLesson = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Unauthorized."
      );
    }

    const id = Number(
      req.params.id
    );

    const {
      title,
      content,
    } = req.body;

    if (Number.isNaN(id)) {
      return errorResponse(
        res,
        400,
        "Invalid lesson ID."
      );
    }

    if (!title || !content) {
      return errorResponse(
        res,
        400,
        "Lesson title and content are required."
      );
    }

    const existingLesson =
      await prisma.lesson.findUnique({
        where: {
          id,
        },
        include: {
          course: true,
        },
      });

    if (!existingLesson) {
      return errorResponse(
        res,
        404,
        "Lesson not found."
      );
    }

    const isAdmin =
      req.user.role === "ADMIN";

    const isOwner =
      existingLesson.course
        .instructorId ===
      req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        403,
        "You can only edit lessons in your own courses."
      );
    }

    const updatedLesson =
      await prisma.lesson.update({
        where: {
          id,
        },
        data: {
          title,
          content,
        },
      });

    await writeSystemLog("LESSON_UPDATED", {
      userId: req.user.id,
      details: `Lesson ${id}`,
    });

    return successResponse(
      res,
      200,
      "Lesson updated successfully.",
      updatedLesson
    );
  } catch (error) {
    console.error(
      "Update lesson error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to update lesson."
    );
  }
};

export const deleteLesson = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(
        res,
        401,
        "Unauthorized."
      );
    }

    const id = Number(
      req.params.id
    );

    if (Number.isNaN(id)) {
      return errorResponse(
        res,
        400,
        "Invalid lesson ID."
      );
    }

    const existingLesson =
      await prisma.lesson.findUnique({
        where: {
          id,
        },
        include: {
          course: true,
        },
      });

    if (!existingLesson) {
      return errorResponse(
        res,
        404,
        "Lesson not found."
      );
    }

    const isAdmin =
      req.user.role === "ADMIN";

    const isOwner =
      existingLesson.course
        .instructorId ===
      req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        403,
        "You can only delete lessons from your own courses."
      );
    }

    await prisma.lesson.delete({
      where: {
        id,
      },
    });

    await writeSystemLog("LESSON_DELETED", {
      userId: req.user.id,
      details: `Lesson ${id}`,
    });

    return successResponse(
      res,
      200,
      "Lesson deleted successfully."
    );
  } catch (error) {
    console.error(
      "Delete lesson error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Failed to delete lesson."
    );
  }
};