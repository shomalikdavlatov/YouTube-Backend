import { Matches } from 'class-validator';

export default class VerifyPhoneOtpDto {
  @Matches(/^(\+998)?[0-9]{9}$/, {
    message: 'Phone number must be valid Uzbekistan format',
  })
  phone_number: string;
  @Matches(/^\d{4}$/, { message: 'Code must be exactly 4 digits' })
  code: string;
}
