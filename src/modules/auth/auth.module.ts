import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import OtpService from './otp.service';
import OtpSecurityService from './otp.security.service';
import SmsService from './sms.service';
import EmailService from './email.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OtpService, OtpSecurityService, SmsService, EmailService],
})
export class AuthModule {}
