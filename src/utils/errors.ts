import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details: any[] = []) {
    super(message, StatusCodes.BAD_REQUEST, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class RateLimitExceededError extends AppError {
  constructor() {
    super(
      'Too many requests, please try again later',
      StatusCodes.TOO_MANY_REQUESTS,
      'RATE_LIMIT_EXCEEDED'
    );
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, StatusCodes.NOT_FOUND, 'NOT_FOUND');
  }
}