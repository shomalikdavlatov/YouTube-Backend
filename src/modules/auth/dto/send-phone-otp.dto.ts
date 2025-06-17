import { Matches } from "class-validator";

export default class SendPhoneOtpDto {
  @Matches(/^(\+998)?[0-9]{9}$/, {
    message: 'Phone number must be valid Uzbekistan format',
  })
  phone_number: string;
}