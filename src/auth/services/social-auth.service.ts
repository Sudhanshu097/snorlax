import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SocialAuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateOAuthLogin(profile: any, provider: string) {
    const email = profile.emails[0].value;
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        provider,
        providerId: profile.id,
        isEmailVerified: true,
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }

  async handleAppleLogin(appleId: string, email: string, fullName: any) {
    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        firstName: fullName?.givenName || '',
        lastName: fullName?.familyName || '',
        provider: 'apple',
        providerId: appleId,
        isEmailVerified: true,
      });
    }

    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7d',
      }),
    };
  }
}