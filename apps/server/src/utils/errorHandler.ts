// Define ErrorHandler class to handle custom errors with status codes
class ErrorHandler extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Capture stack trace to identify where the error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
