import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
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
import SendEmailDto from './dto/send-email.dto';
import VerifyEmailDto from './dto/verify-email.dto';
import EmailService from './email.service';

@Injectable()
export class AuthService {
  constructor(
    private otpService: OtpService,
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private redisService: RedisService,
    private emailService: EmailService
  ) {}
  async sendPhoneOtp(body: SendPhoneOtpDto) {
    const phoneNumber = body.phone_number;
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
  async sendEmailOtp(body: SendEmailOtpDto) {
    
  }
  async verifyEmailOtp(body: VerifyEmailOtpDto) {}
  async sendEmail(body: SendEmailDto) {
    await this.emailService.sendEmailUrl(body.email);
    return {message: `Email has been sent to ${body.email} successfully!`};
  }
  async verifyEmail(query: VerifyEmailDto, userId: string) {
    const email = await this.emailService.verifySessionToken(query.token);
    await this.prismaService.prisma.user.update({where: {id: userId}, data: {email}});
    return {message: "Email has been verificated successfully!"};
  }
  async register(body: RegisterDto) {
    let token: string;
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
    await this.redisService.del(key);
    const user = await this.prismaService.prisma.user.create({
      data: {
        username: body.username,
        phoneNumber: body.phone_number,
        password,
        firstName: body.first_name,
        lastName: body.last_name,
      },
    });
    token = await this.jwtService.signAsync({
      userId: user.id,
      userRole: user.role
    });
    return { token, message: 'Registered successfully!' };
  }
  async login(body: LoginDto) {
    let token: string;
    if (body.username) {
      const user = await this.prismaService.prisma.user.findFirst({
        where: { username: body.username },
      });
      if (
        !user ||
        (await bcrypt.compare(body.password as string, user.password))
      )
        throw new UnauthorizedException('Username or password is incorrect!');
      token = await this.jwtService.signAsync({
        userId: user.id,
        userRole: user.role,
      });
    }
    if (body.phone_number) {
      const user = await this.prismaService.prisma.user.findFirst({
        where: { phoneNumber: body.phone_number },
      });
      if (!user)
        throw new NotFoundException(
          'User with specified phone number not found!',
        );
      const key = `session-token:${body.phone_number}`;
      await this.otpService.checkSessionToken(
        key,
        body.session_token as string,
      );
      await this.redisService.del(key);
      token = await this.jwtService.signAsync({ userId: user.id, userRole: user.role });
    }
    return { token: token!, message: 'Logged in successfully!' };
  }
}
