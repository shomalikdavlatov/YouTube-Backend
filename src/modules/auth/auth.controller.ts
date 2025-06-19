import { Body, Controller, Get, Post, Query, Req, Res, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import SendPhoneOtpDto from './dto/send-phone-otp.dto';
import SendEmailOtpDto from './dto/send-email-otp.dto';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import VerifyPhoneOtpDto from './dto/verify-phone-otp.dto';
import VerifyEmailOtpDto from './dto/verify-email-otp.dto';
import { Request, Response } from 'express';
import VerifyEmailDto from './dto/verify-email.dto';
import SendEmailDto from './dto/send-email.dto';

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
  @Post('send-email')
  @SetMetadata("isFreeAuth", false)
  async sendEmail(@Body() body: SendEmailDto) {
    return await this.authService.sendEmail(body);
  }
  @Get('verify-email')
  @SetMetadata("isFreeAuth", false)
  async verifyEmail(@Query() query: VerifyEmailDto, @Req() req: Request) {
    return await this.authService.verifyEmail(query, req['user'].userId);
  }
  @Post('register')
  async register(@Body() body: RegisterDto, @Res({passthrough: true}) res: Response) {
    const {token, ...result} = await this.authService.register(body);
    res.cookie('jwt', token, {
      httpOnly: true, 
      maxAge: 4 * 60 * 60 * 1000 + 100 * 1000
    })
    return result
  }
  @Post('login')
  async login(@Body() body: LoginDto, @Res({passthrough: true}) res: Response) {
    const {token, ...result} = await this.authService.login(body);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 4 * 60 * 60 * 1000 + 100 * 1000,
    });
    return result;
  }
}
