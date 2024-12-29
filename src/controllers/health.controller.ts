import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/asyncHandler';

export class HealthController {
  check = asyncHandler(async (req: Request, res: Response) => {
    res.status(StatusCodes.OK).json({
      status: 'success',
      message: 'Service is healthy',
    });
  });
}