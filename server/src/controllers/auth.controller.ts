import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

import {
  emailRegex,
  passwordRegex,
  publicRegisterRoles,
} from "../utils/validators";

import {
  successResponse,
  errorResponse,
} from "../utils/responses";
import { writeSystemLog } from "../utils/systemLog";

const dbRoleFromAppRole = (role: string) => {
  if (role === "ADMIN") {
    return "ADMINISTRATOR";
  }

  return role;
};

const appRoleFromDbRole = (role: string) => {
  if (role === "ADMINISTRATOR") {
    return "ADMIN";
  }

  return role;
};

export const register = async (
  req: Request,
  res: Response
) => {
  try {
    let { name, email, password, role } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();

    if (!name || !email || !password || !role) {
      return errorResponse(
        res,
        400,
        "All fields are required."
      );
    }

    if (!emailRegex.test(email)) {
      return errorResponse(
        res,
        400,
        "Please enter a valid email address."
      );
    }

    if (!passwordRegex.test(password)) {
      return errorResponse(
        res,
        400,
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character."
      );
    }

    if (!publicRegisterRoles.includes(role)) {
      return errorResponse(
        res,
        400,
        "Invalid role. Public registration is limited to STUDENT or INSTRUCTOR."
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingUser) {
      return errorResponse(
        res,
        409,
        "An account with this email already exists."
      );
    }

    const passwordHash =
      await bcrypt.hash(password, 10);

    const databaseRole =
      dbRoleFromAppRole(role);

    const user =
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: databaseRole as any,
        },
      });

    await writeSystemLog("USER_REGISTERED", {
      userId: user.id,
      details: `email=${user.email} role=${user.role}`,
    });

    return successResponse(
      res,
      201,
      "Registration successful.",
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: appRoleFromDbRole(user.role),
      }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Something went wrong. Please try again."
    );
  }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    let { email, password } = req.body;

    email = email?.trim().toLowerCase();

    if (!email || !password) {
      return errorResponse(
        res,
        400,
        "Email and password are required."
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (!user) {
      return errorResponse(
        res,
        401,
        "Invalid email or password."
      );
    }

    if (user.status === "SUSPENDED") {
      return errorResponse(
        res,
        403,
        "Your account has been suspended."
      );
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatch) {
      return errorResponse(
        res,
        401,
        "Invalid email or password."
      );
    }

    const appRole =
      appRoleFromDbRole(user.role);

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        "JWT_SECRET is not configured."
      );

      return errorResponse(
        res,
        500,
        "Server configuration error."
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: appRole,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    await writeSystemLog("USER_LOGIN", {
      userId: user.id,
      details: `email=${user.email}`,
    });

    return successResponse(
      res,
      200,
      "Login successful.",
      {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: appRole,
        },
      }
    );
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return errorResponse(
      res,
      500,
      "Something went wrong. Please try again."
    );
  }
};