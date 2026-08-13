import { Response } from "express";

export const successResponse = (
  res: Response,
  status: number,
  message: string,
  data?: unknown
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  status: number,
  message: string
) => {
  return res.status(status).json({
    success: false,
    message,
  });
};