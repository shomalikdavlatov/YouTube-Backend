import { ResendService } from 'nestjs-resend';
import OtpService from './otp.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import RedisService from 'src/core/database/redis.service';

@Injectable()
export default class EmailService {
  private linkTtl: number = 86400;
  private sendTimeLimit: number = 30;
  private sendCountLimitHourly: number = 10;
  constructor(
    private resendService: ResendService,
    private otpService: OtpService,
    private redisService: RedisService,
  ) {}
  async sendEmailUrl(email: string) {
    const token = this.otpService.generateSessionToken();
    await this.setSessionToken(token, email);
    const url = `http://${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}/api/auth/verify-email?token=${token}`;
    const result = await this.resendService.send({
      from: process.env.EMAIL as string,
      to: email,
      subject: 'Email confirmation',
      html: `<p>Your email confirmation link: ${url}</p>`,
    });
    if (result.error) throw new BadRequestException(result.error);
  }
  async setSessionToken(token: string, email: string) {
    const key = `email-verify-token:${token}`;
    await this.redisService.set(key, this.linkTtl, email);
  }
  async verifySessionToken(token: string) {
    const tokenEmail = await this.redisService.get(`email-verify-token:${token}`);
    if (!tokenEmail) throw new UnauthorizedException("Email verification failed");
    return tokenEmail;
  }
}
