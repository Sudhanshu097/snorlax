import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { AuditService } from './audit.service';

@Injectable()
export class SecurityService {
  private loginRateLimiter: RateLimiterRedis;
  private apiRateLimiter: RateLimiterRedis;

  constructor(
    private readonly redis: Redis,
    private configService: ConfigService,
    private auditService: AuditService
  ) {
    this.loginRateLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'login_limit',
      points: 5,
      duration: 60 * 15, // 15 minutes
    });

    this.apiRateLimiter = new RateLimiterRedis({
      storeClient: redis,
      keyPrefix: 'api_limit',
      points: 100,
      duration: 60, // 1 minute
    });
  }

  async checkLoginAttempt(ip: string): Promise<boolean> {
    try {
      await this.loginRateLimiter.consume(ip);
      return true;
    } catch (error) {
      await this.auditService.logEvent({
        userId: 'system',
        action: 'RATE_LIMIT_EXCEEDED',
        resource: 'login',
        details: { ip },
      });
      return false;
    }
  }

  async checkApiLimit(apiKey: string): Promise<boolean> {
    try {
      await this.apiRateLimiter.consume(apiKey);
      return true;
    } catch {
      return false;
    }
  }

  async addToBlocklist(ip: string, reason: string): Promise<void> {
    await this.redis.sadd('security:blocklist', ip);
    await this.auditService.logEvent({
      userId: 'system',
      action: 'IP_BLOCKED',
      resource: 'security',
      details: { ip, reason },
    });
  }

  async isBlocked(ip: string): Promise<boolean> {
    return await this.redis.sismember('security:blocklist', ip);
  }

  async generateApiKey(userId: string, scopes: string[]): Promise<string> {
    const apiKey = Buffer.from(`${userId}:${Date.now()}`).toString('base64');
    
    await this.redis.hset(`apikey:${apiKey}`, {
      userId,
      scopes: JSON.stringify(scopes),
      createdAt: Date.now(),
    });

    await this.auditService.logEvent({
      userId,
      action: 'API_KEY_GENERATED',
      resource: 'security',
      details: { scopes },
    });

    return apiKey;
  }
}