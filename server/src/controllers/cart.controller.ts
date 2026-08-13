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

/** GET /api/cart — list current user's cart items */
export const getCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: {
        Course: {
          include: {
            instructor: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(res, 200, "Cart retrieved.", items);
  } catch (error) {
    console.error("Get cart error:", error);
    return errorResponse(res, 500, "Failed to load cart.");
  }
};

/** POST /api/cart — add a published course to cart */
export const addToCart = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    if (req.user.role !== "STUDENT") {
      return errorResponse(
        res,
        403,
        "Only students can add courses to the cart."
      );
    }

    const courseId = Number(req.body.courseId);
    if (Number.isNaN(courseId)) {
      return errorResponse(res, 400, "Invalid course ID.");
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return errorResponse(res, 404, "Course not found.");
    }

    if (!course.isPublished) {
      return errorResponse(
        res,
        400,
        "Only published courses can be added to the cart."
      );
    }

    const alreadyEnrolled = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: req.user.id,
          courseId,
        },
      },
    });

    if (alreadyEnrolled) {
      return errorResponse(
        res,
        400,
        "You are already enrolled in this course."
      );
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return errorResponse(res, 400, "Course is already in your cart.");
    }

    const item = await prisma.cartItem.create({
      data: {
        userId: req.user.id,
        courseId,
      },
      include: {
        Course: true,
      },
    });

    return successResponse(res, 201, "Course added to cart.", item);
  } catch (error) {
    console.error("Add to cart error:", error);
    return errorResponse(res, 500, "Failed to add course to cart.");
  }
};

/** DELETE /api/cart/:courseId — remove item from cart */
export const removeFromCart = async (
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

    const item = await prisma.cartItem.findUnique({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
    });

    if (!item) {
      return errorResponse(res, 404, "Item not found in cart.");
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return successResponse(res, 200, "Item removed from cart.");
  } catch (error) {
    console.error("Remove from cart error:", error);
    return errorResponse(res, 500, "Failed to remove item.");
  }
};

/**
 * POST /api/cart/checkout
 * Simulated payment: for each cart item create Transaction + Enrollment,
 * then clear the cart. No real card data is collected.
 */
export const checkout = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized.");
    }

    if (req.user.role !== "STUDENT") {
      return errorResponse(
        res,
        403,
        "Only students can checkout."
      );
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { Course: true },
    });

    if (cartItems.length === 0) {
      return errorResponse(res, 400, "Your cart is empty.");
    }

    const results: {
      courseId: number;
      enrollmentId: number;
      transactionId: number;
    }[] = [];

    // Process sequentially for clarity in MVP
    for (const item of cartItems) {
      const course = item.Course;

      if (!course.isPublished) {
        continue;
      }

      const existingEnrollment =
        await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: req.user.id,
              courseId: course.id,
            },
          },
        });

      if (existingEnrollment) {
        await prisma.cartItem.delete({ where: { id: item.id } });
        continue;
      }

      const transaction = await prisma.transaction.create({
        data: {
          userId: req.user.id,
          courseId: course.id,
          amount: course.price,
          status: "COMPLETED",
        },
      });

      const enrollment = await prisma.enrollment.create({
        data: {
          studentId: req.user.id,
          courseId: course.id,
          progressPercent: 0,
          completedLessons: [],
          status: "ACTIVE",
        },
      });

      await prisma.cartItem.delete({ where: { id: item.id } });

      await writeSystemLog("COURSE_PURCHASED", {
        userId: req.user.id,
        details: `Course ${course.id} (${course.title}) amount=${course.price} tx=${transaction.id}`,
      });

      await writeSystemLog("ENROLLMENT_CREATED", {
        userId: req.user.id,
        details: `Enrollment ${enrollment.id} for course ${course.id}`,
      });

      results.push({
        courseId: course.id,
        enrollmentId: enrollment.id,
        transactionId: transaction.id,
      });
    }

    return successResponse(
      res,
      200,
      "Payment simulated successfully. You are now enrolled.",
      { purchases: results }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return errorResponse(res, 500, "Checkout failed.");
  }
};
