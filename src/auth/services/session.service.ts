import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  private readonly sessionDuration: number;
  private readonly rememberMeDuration: number;

  constructor(
    private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.sessionDuration = this.configService.get('SESSION_DURATION', 3600);
    this.rememberMeDuration = this.configService.get('REMEMBER_ME_DURATION', 2592000);
  }

  async createSession(userId: string, rememberMe = false): Promise<string> {
    const sessionId = uuidv4();
    const duration = rememberMe ? this.rememberMeDuration : this.sessionDuration;
    
    await this.redis.setex(
      `session:${sessionId}`,
      duration,
      JSON.stringify({
        userId,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      })
    );

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.redis.get(`session:${sessionId}`);
    if (!session) return false;

    const sessionData = JSON.parse(session);
    await this.updateLastActivity(sessionId);
    
    return true;
  }

  async updateLastActivity(sessionId: string): Promise<void> {
    const session = await this.redis.get(`session:${sessionId}`);
    if (session) {
      const sessionData = JSON.parse(session);
      sessionData.lastActivity = Date.now();
      
      const ttl = await this.redis.ttl(`session:${sessionId}`);
      await this.redis.setex(
        `session:${sessionId}`,
        ttl,
        JSON.stringify(sessionData)
      );
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  async getUserSessions(userId: string): Promise<string[]> {
    const keys = await this.redis.keys('session:*');
    const sessions = [];

    for (const key of keys) {
      const session = await this.redis.get(key);
      if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.userId === userId) {
          sessions.push(key.replace('session:', ''));
        }
      }
    }

    return sessions;
  }
}