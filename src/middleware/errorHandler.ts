import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

interface ErrorResponse {
  status: string;
  message: string;
  code?: string;
  stack?: string;
}

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

// Add ErrorRequestHandler type
export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const response: ErrorResponse = {
    status: "error",
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  if (err instanceof AppError) {
    res.status(err.statusCode).json(response);
    return;
  }

  res.status(500).json(response);
  return;
};
