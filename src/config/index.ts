import dotenv from 'dotenv';
import { Config } from '../types/config';

dotenv.config();

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  rateLimits: {
    public: {
      windowMs: 15 * 60 * 1000,
      max: 100,
    },
    authenticated: {
      windowMs: 15 * 60 * 1000,
      max: 200,
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED === 'true',
  },
};