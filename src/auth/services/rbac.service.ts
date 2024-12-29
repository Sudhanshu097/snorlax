import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RBACService {
  constructor(private readonly redis: Redis) {}

  async getRolePermissions(role: string): Promise<string[]> {
    const permissions = await this.redis.smembers(`role:${role}:permissions`);
    return permissions;
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const roles = await this.redis.smembers(`user:${userId}:roles`);
    
    for (const role of roles) {
      const permissions = await this.getRolePermissions(role);
      if (permissions.includes(permission)) {
        return true;
      }
    }
    
    return false;
  }

  async addRoleToUser(userId: string, role: string): Promise<void> {
    await this.redis.sadd(`user:${userId}:roles`, role);
  }

  async removeRoleFromUser(userId: string, role: string): Promise<void> {
    await this.redis.srem(`user:${userId}:roles`, role);
  }

  async addPermissionToRole(role: string, permission: string): Promise<void> {
    await this.redis.sadd(`role:${role}:permissions`, permission);
  }
}