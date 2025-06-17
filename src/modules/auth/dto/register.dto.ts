import { IsString, IsStrongPassword, Length, Matches } from 'class-validator';

export default class RegisterDto {
  @Matches(/^(\+998)?[0-9]{9}$/, {
    message: 'Phone number must be valid Uzbekistan format',
  })
  phone_number: string;
  @IsString()
  @Length(3, 50)
  username: string;
  @IsStrongPassword()
  password: string;
  @IsString()
  @Length(1, 50)
  first_name: string;
  @IsString()
  @Length(1, 50)
  last_name: string;
  @IsString()
  session_token: string;
}
