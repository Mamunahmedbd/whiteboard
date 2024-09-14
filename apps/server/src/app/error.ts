/* eslint-disable @typescript-eslint/no-explicit-any */
import ErrorHandler from '@/utils/errorHandler';
import type { Request, Response, NextFunction } from 'express';
// import  express from 'express';

// Define interface for global error handler function
interface GlobalErrorHandler {
  (
    error: ErrorHandler | unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void;
}

// Function to determine if an error is a known ErrorHandler instance
const isKnownError = (error: unknown): error is ErrorHandler => {
  return error instanceof ErrorHandler;
};

// Function to create standardized error responses
const createErrorResponse = (
  res: Response,
  statusCode: number,
  message: string,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// Global Error Handler Function
const globalErrorHandler: GlobalErrorHandler = (error, _req, res, _next) => {
  // Default error properties
  const statusCode = isKnownError(error) ? error.statusCode : 500;
  const message = isKnownError(error) ? error.message : 'Internal Server Error';

  // Handle specific error types based on properties of the error object
  if (error instanceof Error) {
    switch (error.name) {
      case 'CastError':
        return createErrorResponse(
          res,
          400,
          `Resource not found. Invalid: ${(error as any).path}`,
        );
      case 'JsonWebTokenError':
        return createErrorResponse(
          res,
          400,
          'Invalid JSON Web Token, Try again.',
        );
      case 'TokenExpiredError':
        return createErrorResponse(
          res,
          400,
          'Expired JSON Web Token, Try again.',
        );
    }
  }

  // Handle MongoDB duplicate key error
  if (
    typeof (error as any).code === 'number' &&
    (error as any).code === 11000
  ) {
    const keyValue = (error as any).keyValue || {};
    return createErrorResponse(
      res,
      400,
      `Duplicate ${Object.keys(keyValue).join(', ')} entered.`,
    );
  }

  // Default error response
  createErrorResponse(res, statusCode, message);
};

export { globalErrorHandler };
