import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordPolicyService {
  private readonly minLength: number;
  private readonly requireUppercase: boolean;
  private readonly requireLowercase: boolean;
  private readonly requireNumbers: boolean;
  private readonly requireSpecialChars: boolean;
  private readonly passwordHistory: number;

  constructor(private configService: ConfigService) {
    this.minLength = this.configService.get('PASSWORD_MIN_LENGTH', 8);
    this.requireUppercase = this.configService.get('PASSWORD_REQUIRE_UPPERCASE', true);
    this.requireLowercase = this.configService.get('PASSWORD_REQUIRE_LOWERCASE', true);
    this.requireNumbers = this.configService.get('PASSWORD_REQUIRE_NUMBERS', true);
    this.requireSpecialChars = this.configService.get('PASSWORD_REQUIRE_SPECIAL', true);
    this.passwordHistory = this.configService.get('PASSWORD_HISTORY', 3);
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`Password must be at least ${this.minLength} characters long`);
    }

    if (this.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (this.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (this.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (this.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async checkPasswordHistory(userId: string, password: string, passwordHistory: string[]): Promise<boolean> {
    for (const historicPassword of passwordHistory) {
      if (await bcrypt.compare(password, historicPassword)) {
        return false;
      }
    }
    return true;
  }

  generatePasswordHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}