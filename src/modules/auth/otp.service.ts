import { Injectable } from "@nestjs/common";
import {generate} from "otp-generator";

@Injectable()
export default class OtpService {
    generateOtp() {
        return generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
    }
}