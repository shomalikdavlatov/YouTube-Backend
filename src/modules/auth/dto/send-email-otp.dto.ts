import { IsEmail } from "class-validator";

export default class SendEmailOtpDto {
    @IsEmail()
    email: string;
}