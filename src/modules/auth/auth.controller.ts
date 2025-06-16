import { Controller, Post, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
@SetMetadata('isFreeAuth', true)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('send-phone-otp')
  async sendPhoneOtp() {}
  @Post('verify-phone-otp')
  async verifyPhoneOtp() {}
  @Post('send-email-otp')
  async sendEmailOtp() {}
  @Post('verify-email-otp')
  async verifyEmailOtp() {}
  @Post('register')
  async register() {}
  @Post('login')
  async login() {}
}
