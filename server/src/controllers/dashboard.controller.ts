import { Request, Response } from "express";
import prisma from "../lib/prisma";

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const getDashboard = async (
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

    const { id, role } = req.user;

    if (role === "ADMIN") {
      const [
        users,
        students,
        instructors,
        courses,
        publishedCourses,
        enrollments,
        transactions,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "INSTRUCTOR" } }),
        prisma.course.count(),
        prisma.course.count({ where: { isPublished: true } }),
        prisma.enrollment.count(),
        prisma.transaction.count(),
      ]);

      return res.json({
        role,
        data: {
          users,
          students,
          instructors,
          courses,
          publishedCourses,
          enrollments,
          transactions,
        },
      });
    }

    if (role === "INSTRUCTOR") {
      const courses = await prisma.course.count({
        where: { instructorId: id },
      });

      const enrollments = await prisma.enrollment.count({
        where: {
          course: { instructorId: id },
        },
      });

      const published = await prisma.course.count({
        where: { instructorId: id, isPublished: true },
      });

      return res.json({
        role,
        data: {
          courses,
          published,
          enrollments,
        },
      });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: id },
      select: { progressPercent: true },
    });

    const enrolledCourses = enrollments.length;
    const avgProgress =
      enrolledCourses === 0
        ? 0
        : Math.round(
            enrollments.reduce((s, e) => s + e.progressPercent, 0) /
              enrolledCourses
          );

    return res.json({
      role,
      data: {
        enrolledCourses,
        avgProgress,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard.",
    });
  }
};
