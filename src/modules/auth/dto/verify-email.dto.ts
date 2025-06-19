import { IsString } from 'class-validator';

export default class VerifyEmailDto {
  @IsString()
  token: string;
}
