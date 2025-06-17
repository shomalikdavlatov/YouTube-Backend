import { IsEmail, Matches } from 'class-validator';

export default class VerifyEmailOtpDto {
  @IsEmail()
  email: string;
  @Matches(/^\d{4}$/, { message: 'Code must be exactly 4 digits' })
  code: string;
}
