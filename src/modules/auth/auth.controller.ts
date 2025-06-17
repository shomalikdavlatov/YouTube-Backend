import { Body, Controller, Post, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import SendPhoneOtpDto from './dto/send-phone-otp.dto';
import SendEmailOtpDto from './dto/send-email-otp.dto';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import VerifyPhoneOtpDto from './dto/verify-phone-otp.dto';
import VerifyEmailOtpDto from './dto/verify-email-otp.dto';

@Controller('auth')
@SetMetadata('isFreeAuth', true)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('send-phone-otp')
  async sendPhoneOtp(@Body() body: SendPhoneOtpDto) {
    return await this.authService.sendPhoneOtp(body);
  }
  @Post('verify-phone-otp')
  async verifyPhoneOtp(@Body() body: VerifyPhoneOtpDto) {
    return await this.authService.verifyPhoneOtp(body);
  }
  @Post('send-email-otp')
  async sendEmailOtp(@Body() body: SendEmailOtpDto) {
    return await this.authService.sendEmailOtp(body);
  }
  @Post('verify-email-otp')
  async verifyEmailOtp(@Body() body: VerifyEmailOtpDto) {
    return await this.authService.verifyEmailOtp(body);
  }
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }
}
