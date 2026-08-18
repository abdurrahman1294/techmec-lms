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

const appRoleFromDbRole = (role: string) => {
  if (role === "ADMINISTRATOR") return "ADMIN";
  return role;
};

/** GET /api/admin/users */
export const listUsers = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { id: "asc" },
    });

    const mapped = users.map((u) => ({
      ...u,
      role: appRoleFromDbRole(u.role),
    }));

    return successResponse(res, 200, "Users retrieved.", mapped);
  } catch (error) {
    console.error("List users error:", error);
    return errorResponse(res, 500, "Failed to list users.");
  }
};

/** PATCH /api/admin/users/:id/status  body: { status: "ACTIVE" | "SUSPENDED" } */
export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const id = Number(req.params.id);
    const { status } = req.body;

    if (Number.isNaN(id)) {
      return errorResponse(res, 400, "Invalid user ID.");
    }

    if (status !== "ACTIVE" && status !== "SUSPENDED") {
      return errorResponse(
        res,
        400,
        'Status must be "ACTIVE" or "SUSPENDED".'
      );
    }

    if (id === req.user.id) {
      return errorResponse(
        res,
        400,
        "You cannot change your own status."
      );
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 404, "User not found.");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    const action =
      status === "SUSPENDED" ? "USER_SUSPENDED" : "USER_ACTIVATED";

    await writeSystemLog(action, {
      userId: req.user.id,
      details: `Target user ${id} (${user.email}) set to ${status}`,
    });

    return successResponse(res, 200, `User ${status.toLowerCase()}.`, {
      ...updated,
      role: appRoleFromDbRole(updated.role),
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return errorResponse(res, 500, "Failed to update user status.");
  }
};

/** GET /api/admin/stats — richer MVP statistics */
export const getAdminStats = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalTransactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.user.count({ where: { role: "ADMINISTRATOR" } }),
      prisma.course.count(),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.transaction.count(),
    ]);

    return successResponse(res, 200, "Statistics retrieved.", {
      totalUsers,
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalTransactions,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return errorResponse(res, 500, "Failed to load statistics.");
  }
};

/** GET /api/admin/logs — recent system logs (MVP audit view) */
export const getSystemLogs = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        User: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return successResponse(res, 200, "Logs retrieved.", logs);
  } catch (error) {
    console.error("Get logs error:", error);
    return errorResponse(res, 500, "Failed to load logs.");
  }
};


/** GET /api/admin/transactions */

export const listTransactions = async (
  _req: AuthRequest,
  res: Response
) => {
  try {
    // Path 1: Prisma include
    try {
      const rows = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          User: { select: { id: true, name: true, email: true } },
          Course: { select: { id: true, title: true, price: true } },
        },
      });
      return successResponse(res, 200, "Transactions retrieved.", rows);
    } catch (e1: any) {
      console.error("TX include failed:", e1?.message || e1);
    }

    // Path 2: plain + manual join
    try {
      const plain = await prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      const userIds = Array.from(new Set(plain.map((r) => r.userId)));
      const courseIds = Array.from(new Set(plain.map((r) => r.courseId)));

      const [users, courses] = await Promise.all([
        userIds.length
          ? prisma.user.findMany({
              where: { id: { in: userIds } },
              select: { id: true, name: true, email: true },
            })
          : Promise.resolve([] as { id: number; name: string | null; email: string }[]),
        courseIds.length
          ? prisma.course.findMany({
              where: { id: { in: courseIds } },
              select: { id: true, title: true, price: true },
            })
          : Promise.resolve([] as { id: number; title: string; price: number }[]),
      ]);

      const userMap = new Map(users.map((u) => [u.id, u]));
      const courseMap = new Map(courses.map((c) => [c.id, c]));

      const rows = plain.map((r) => ({
        id: r.id,
        userId: r.userId,
        courseId: r.courseId,
        amount: r.amount,
        status: r.status,
        createdAt: r.createdAt,
        User: userMap.get(r.userId) || null,
        Course: courseMap.get(r.courseId) || null,
      }));

      return successResponse(res, 200, "Transactions retrieved.", rows);
    } catch (plainErr: any) {
      console.error("TX plain failed:", plainErr?.message || plainErr);
    }

    // Path 3: raw SQL
    try {
      const raw = await prisma.$queryRawUnsafe(`
        SELECT
          t.id,
          t."userId",
          t."courseId",
          t.amount,
          t.status,
          t."createdAt",
          u.name AS user_name,
          u.email AS user_email,
          c.title AS course_title
        FROM "Transaction" t
        LEFT JOIN "User" u ON u.id = t."userId"
        LEFT JOIN "Course" c ON c.id = t."courseId"
        ORDER BY t."createdAt" DESC
        LIMIT 100
      `);

      const rows = (raw as any[]).map((r) => ({
        id: Number(r.id),
        userId: Number(r.userId),
        courseId: Number(r.courseId),
        amount: Number(r.amount),
        status: String(r.status),
        createdAt: r.createdAt,
        User: r.user_email
          ? { name: r.user_name, email: r.user_email }
          : null,
        Course: r.course_title ? { title: r.course_title } : null,
      }));

      return successResponse(res, 200, "Transactions retrieved.", rows);
    } catch (rawErr: any) {
      console.error("Transactions raw failed:", rawErr);
      return errorResponse(
        res,
        500,
        `Failed to load transactions: ${rawErr?.message || "unknown"}. If the table is missing, run: npx prisma@6.19.3 migrate deploy`
      );
    }
  } catch (error: any) {
    console.error("List transactions outer error:", error);
    return errorResponse(
      res,
      500,
      error?.message || "Failed to load transactions."
    );
  }
};
