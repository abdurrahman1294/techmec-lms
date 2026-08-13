import { writeSystemLog } from "../utils/systemLog";
import { Request, Response } from "express";
import prisma from "../lib/prisma";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const enrollInCourse = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const courseId = Number(req.params.courseId);

    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const existingEnrollment =
      await prisma.enrollment.findUnique({
        where: {
          studentId_courseId: {
            studentId: req.user.id,
            courseId,
          },
        },
      });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course.",
      });
    }

    const enrollment =
      await prisma.enrollment.create({
        data: {
          studentId: req.user.id,
          courseId,
        },
      });

    await writeSystemLog("ENROLLMENT_CREATED", {
      userId: req.user.id,
      details: `course ${courseId} enrollment ${enrollment.id}`,
    });

    return res.status(201).json({
      success: true,
      message: "Enrollment successful.",
      data: enrollment,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to enroll in course.",
    });
  }
};

export const getMyCourses = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const enrollments =
      await prisma.enrollment.findMany({
        where: {
          studentId: req.user.id,
        },
        include: {
          course: {
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    return res.json({
      success: true,
      data: enrollments,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses.",
    });
  }
};