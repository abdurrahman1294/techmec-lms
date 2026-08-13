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

export const createCourse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const {
      title,
      description,
      category,
      price,
      thumbnailUrl,
      learningObjectives,
      isPublished,
    } = req.body;

    if (!title || !description) {
      return errorResponse(
        res,
        400,
        "Title and description are required."
      );
    }

    const parsedPrice =
      price !== undefined && price !== null
        ? Number(price)
        : 0;

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return errorResponse(res, 400, "Price must be a non-negative number.");
    }

    let objectives: string[] = [];
    if (Array.isArray(learningObjectives)) {
      objectives = learningObjectives
        .map((o: unknown) => String(o).trim())
        .filter(Boolean);
    } else if (typeof learningObjectives === "string") {
      objectives = learningObjectives
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // ADMIN may assign an instructor; otherwise the creator is the instructor.
    // This keeps ADMIN-created courses from always being "owned" by the admin.
    let instructorId = req.user.id;
    if (req.user.role === "ADMIN" && req.body.instructorId != null) {
      const assignedId = Number(req.body.instructorId);
      if (Number.isNaN(assignedId)) {
        return errorResponse(res, 400, "Invalid instructorId.");
      }
      const instructor = await prisma.user.findUnique({
        where: { id: assignedId },
      });
      if (!instructor || instructor.role !== "INSTRUCTOR") {
        return errorResponse(
          res,
          400,
          "instructorId must refer to an existing INSTRUCTOR user."
        );
      }
      instructorId = assignedId;
    }

    const course = await prisma.course.create({
      data: {
        title: String(title).trim(),
        description: String(description).trim(),
        category: category ? String(category).trim() : "General",
        price: parsedPrice,
        thumbnailUrl: thumbnailUrl
          ? String(thumbnailUrl).trim()
          : null,
        learningObjectives: objectives,
        isPublished: Boolean(isPublished),
        instructorId,
      },
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    await writeSystemLog("COURSE_CREATED", {
      userId: req.user.id,
      details: `Course ${course.id}: ${course.title}`,
    });

    if (course.isPublished) {
      await writeSystemLog("COURSE_PUBLISHED", {
        userId: req.user.id,
        details: `Course ${course.id}`,
      });
    }

    return successResponse(
      res,
      201,
      "Course created successfully.",
      course
    );
  } catch (error) {
    console.error("Create course error:", error);
    return errorResponse(res, 500, "Failed to create course.");
  }
};

export const getCourses = async (
  req: Request,
  res: Response
) => {
  try {
    const publishedOnly =
      req.query.published === "true" ||
      req.query.published === "1";

    const courses = await prisma.course.findMany({
      where: publishedOnly ? { isPublished: true } : undefined,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { lessons: true, enrollments: true },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return successResponse(
      res,
      200,
      "Courses retrieved successfully.",
      courses
    );
  } catch (error) {
    console.error("Get courses error:", error);
    return errorResponse(res, 500, "Failed to fetch courses.");
  }
};

export const getCourseById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lessons: {
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            title: true,
            sortOrder: true,
            createdAt: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    return successResponse(
      res,
      200,
      "Course retrieved successfully.",
      course
    );
  } catch (error) {
    console.error("Get course error:", error);
    return errorResponse(res, 500, "Failed to fetch course.");
  }
};

export const updateCourse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return errorResponse(res, 404, "Course not found.");
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = existingCourse.instructorId === req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        403,
        "You can only edit your own courses."
      );
    }

    const {
      title,
      description,
      category,
      price,
      thumbnailUrl,
      learningObjectives,
      isPublished,
    } = req.body;

    const data: Record<string, unknown> = {};

    if (title !== undefined) data.title = String(title).trim();
    if (description !== undefined)
      data.description = String(description).trim();
    if (category !== undefined)
      data.category = String(category).trim() || "General";
    if (price !== undefined) {
      const parsed = Number(price);
      if (Number.isNaN(parsed) || parsed < 0) {
        return errorResponse(
          res,
          400,
          "Price must be a non-negative number."
        );
      }
      data.price = parsed;
    }
    if (thumbnailUrl !== undefined) {
      data.thumbnailUrl = thumbnailUrl
        ? String(thumbnailUrl).trim()
        : null;
    }
    if (learningObjectives !== undefined) {
      if (Array.isArray(learningObjectives)) {
        data.learningObjectives = learningObjectives
          .map((o: unknown) => String(o).trim())
          .filter(Boolean);
      } else if (typeof learningObjectives === "string") {
        data.learningObjectives = learningObjectives
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }
    if (isPublished !== undefined) {
      data.isPublished = Boolean(isPublished);
    }

    if (Object.keys(data).length === 0) {
      return errorResponse(res, 400, "No fields to update.");
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await writeSystemLog("COURSE_UPDATED", {
      userId: req.user.id,
      details: `Course ${id}`,
    });

    if (
      isPublished !== undefined &&
      Boolean(isPublished) !== existingCourse.isPublished
    ) {
      await writeSystemLog(
        Boolean(isPublished) ? "COURSE_PUBLISHED" : "COURSE_UNPUBLISHED",
        {
          userId: req.user.id,
          details: `Course ${id}`,
        }
      );
    }

    return successResponse(
      res,
      200,
      "Course updated successfully.",
      updatedCourse
    );
  } catch (error) {
    console.error("Update course error:", error);
    return errorResponse(res, 500, "Failed to update course.");
  }
};

export const deleteCourse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return errorResponse(res, 404, "Course not found.");
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = existingCourse.instructorId === req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        403,
        "You can only delete your own courses."
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    await writeSystemLog(
      isAdmin && !isOwner ? "ADMIN_COURSE_REMOVED" : "COURSE_DELETED",
      {
        userId: req.user.id,
        details: `Course ${id}: ${existingCourse.title}`,
      }
    );

    return successResponse(res, 200, "Course deleted successfully.");
  } catch (error) {
    console.error("Delete course error:", error);
    return errorResponse(res, 500, "Failed to delete course.");
  }
};

export const getCourseStudents = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = course.instructorId === req.user.id;

    if (!isAdmin && !isOwner) {
      return errorResponse(
        res,
        403,
        "You can only view students for your own courses."
      );
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            status: true,
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    return successResponse(
      res,
      200,
      "Enrolled students retrieved.",
      enrollments
    );
  } catch (error) {
    console.error("Get course students error:", error);
    return errorResponse(res, 500, "Failed to load students.");
  }
};


/** GET /api/instructor/courses — courses owned by the logged-in instructor (or all for admin) */
export const getMyInstructorCourses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const where =
      req.user.role === "ADMIN"
        ? {}
        : { instructorId: req.user.id };

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { lessons: true, enrollments: true },
        },
      },
      orderBy: { id: "desc" },
    });

    return successResponse(
      res,
      200,
      "Instructor courses retrieved.",
      courses
    );
  } catch (error) {
    console.error("Get instructor courses error:", error);
    return errorResponse(res, 500, "Failed to load instructor courses.");
  }
};
