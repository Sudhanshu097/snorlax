import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';
import { TwilioService } from './twilio.service';
import { EmailService } from '../../email/email.service';

@Injectable()
export class MFAService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private twilioService: TwilioService,
    private emailService: EmailService,
  ) {}

  async generateTOTPSecret(userId: string) {
    const secret = authenticator.generateSecret();
    const user = await this.usersService.findById(userId);
    const appName = this.configService.get('APP_NAME');
    const otpauthUrl = authenticator.keyuri(user.email, appName, secret);
    
    await this.usersService.updateMFASecret(userId, secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
    
    return { secret, qrCodeDataUrl };
  }

  async verifyTOTP(userId: string, token: string) {
    const user = await this.usersService.findById(userId);
    return authenticator.verify({
      token,
      secret: user.mfaSecret,
    });
  }

  async sendSMSCode(userId: string) {
    const user = await this.usersService.findById(userId);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.saveMFACode(userId, code);
    
    return this.twilioService.sendSMS(user.phoneNumber, 
      `Your verification code is: ${code}`);
  }

  async sendEmailCode(userId: string) {
    const user = await this.usersService.findById(userId);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.usersService.saveMFACode(userId, code);
    
    return this.emailService.sendMFACode(user.email, code);
  }

  async verifyCode(userId: string, code: string) {
    const user = await this.usersService.findById(userId);
    return user.mfaCode === code;
  }
}