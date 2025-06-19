import {
  IsString,
  Length,
  IsStrongPassword,
  IsEmail,
  Matches,
  ValidateIf,
} from 'class-validator';

export default class LoginDto {
  @ValidateIf((o) => !o.email && !o.phone_number)
  @IsString()
  @Length(3, 50)
  username?: string;

  @ValidateIf((o) => !!o.username)
  @IsStrongPassword()
  password?: string;

  @ValidateIf((o) => !o.username && !o.phone_number)
  @IsEmail()
  email?: string;

  @ValidateIf((o) => !o.username && !o.email)
  @Matches(/^(\+998)?[0-9]{9}$/, {
    message: 'Phone number must be valid Uzbekistan format',
  })
  phone_number?: string;

  @ValidateIf((o) => !!o.phone_number)
  @IsString()
  session_token?: string;
}
