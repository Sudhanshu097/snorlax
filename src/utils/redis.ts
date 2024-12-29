import Redis from 'ioredis';
import { config } from '../config';
import { logger } from './logger';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (error) => {
  logger.error('Redis error:', error);
});

export { redis };