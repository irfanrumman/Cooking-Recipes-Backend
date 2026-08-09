import httpStatus from "http-status";

export class AppError extends Error {
  public statusCode: number;
  public errorDetails?: unknown;

  constructor(
    message: string,
    statusCode: number = httpStatus.INTERNAL_SERVER_ERROR,
    errorDetails?: unknown
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.errorDetails = errorDetails;

    Error.captureStackTrace(this, this.constructor);
  }
}