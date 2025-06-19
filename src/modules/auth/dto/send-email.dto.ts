import { IsEmail } from 'class-validator';

export default class SendEmailDto {
  @IsEmail()
  email: string;
}
