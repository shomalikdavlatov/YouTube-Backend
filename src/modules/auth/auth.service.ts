import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import SendPhoneOtpDto from './dto/send-phone-otp.dto';
import VerifyPhoneOtpDto from './dto/verify-phone-otp.dto';
import SendEmailOtpDto from './dto/send-email-otp.dto';
import VerifyEmailOtpDto from './dto/verify-email-otp.dto';
import RegisterDto from './dto/register.dto';
import LoginDto from './dto/login.dto';
import OtpService from './otp.service';
import PrismaService from 'src/core/database/prisma.service';
import bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import RedisService from 'src/core/database/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private otpService: OtpService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}
  async sendPhoneOtp(body: SendPhoneOtpDto) {
    const phoneNumber = body.phone_number;
    const findUser = await this.prismaService.prisma.user.findFirst({
      where: { phoneNumber },
    });
    if (findUser)
      throw new ConflictException('This phone number is already registered!');
    const response = await this.otpService.sendPhoneOtp(phoneNumber);
    if (!response) throw new InternalServerErrorException('Server error!');
    return {
      message: `Code sended to ${phoneNumber}`,
    };
  }
  async verifyPhoneOtp(body: VerifyPhoneOtpDto) {
    const sessionToken = await this.otpService.verifyOtp(
      `phone-number-otp:${body.phone_number}`,
      body.code,
    );
    return {
      message: 'success',
      status_code: 200,
      session_token: sessionToken,
    };
  }
  async sendEmailOtp(body: SendEmailOtpDto) {}
  async verifyEmailOtp(body: VerifyEmailOtpDto) {}
  async register(body: RegisterDto) {
    if (
      await this.prismaService.prisma.user.findFirst({
        where: { phoneNumber: body.phone_number },
      })
    )
      throw new ConflictException('This phone number is already registered!');
    if (
      await this.prismaService.prisma.user.findFirst({
        where: { username: body.username },
      })
    )
      throw new ConflictException('This username is already registered!');
    const key = `session-token:${body.phone_number}`;
    await this.otpService.checkSessionToken(key, body.session_token);
    const password = await bcrypt.hash(
      body.password,
      +(process.env.HASH as string),
    );
    const user = await this.prismaService.prisma.user.create({
      data: {
        username: body.username,
        phoneNumber: body.phone_number,
        password,
        firstName: body.first_name,
        lastName: body.last_name,
      },
    });
    const token = await this.jwtService.signAsync({
      userId: user.id,
      userRole: user.role,
    });
    await this.redisService.del(key);
    return token;
  }
  async login(body: LoginDto) {}
}
