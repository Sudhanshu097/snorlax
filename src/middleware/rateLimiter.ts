import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RateLimitExceededError } from '../utils/errors';

const publicLimiter = rateLimit({
  ...config.rateLimits.public,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded:', {
      ip: req.ip,
      path: req.path,
    });
    throw new RateLimitExceededError();
  },
});

const authenticatedLimiter = rateLimit({
  ...config.rateLimits.authenticated,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded for authenticated user:', {
      ip: req.ip,
      path: req.path,
      userId: req.user?.id,
    });
    throw new RateLimitExceededError();
  },
});

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    return authenticatedLimiter(req, res, next);
  }
  return publicLimiter(req, res, next);
};