import { BadRequestException, Injectable } from "@nestjs/common";
import {generate} from "otp-generator";
import RedisService from "src/core/database/redis.service";
import SmsService from "./sms.service";
import OtpSecurityService from "./otp.security.service";

@Injectable()
export default class OtpService {
    constructor(private redisService: RedisService, private smsService: SmsService, private securityService: OtpSecurityService) {}
    generateOtp() {
        return generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false
        });
    }
    generateSessionToken() {
        return crypto.randomUUID();
    }
    async checkOtp(key: string) {
        const otp = await this.redisService.get(key);
        if (otp) {
            const ttl = await this.redisService.ttl(key);
            throw new BadRequestException(`Please try again after ${ttl} seconds!`);
        }
    }
    async sendPhoneOtp(phoneNumber: string) {
        const key = `phone-number-otp:${phoneNumber}`;
        await this.securityService.isTemporaryBlocked(key);
        await this.checkOtp(key);
        const otp = this.generateOtp();
        const response = await this.redisService.set(key, 120, otp);
        if (response === "OK") {
            await this.smsService.sendSms(phoneNumber, otp);
            return true;
        }
        return false;
    }
    async verifyOtp(key: string, code: string) {
        await this.securityService.isTemporaryBlocked(key);
        const otp = await this.redisService.get(key);
        if (!otp) throw new BadRequestException("Invalid code!");
        if (otp !== code) {
            const attempts = await this.securityService.recordFailedOtpAttempt(key);
            throw new BadRequestException({
                message: "Invalid code!",
                attempts: `You have ${attempts} attempts`
            });
        }
        await this.redisService.del(key);
        await this.redisService.del(`otp-attempts:${key}`);
        const sessionToken = this.generateSessionToken();
        await this.redisService.set(
          `session-token:${key.split(":")[1]}`,
          300,
          sessionToken,
        );
        return sessionToken;
    }
    async checkSessionToken(key: string, token: string) {
        const sessionToken: string = (await this.redisService.get(key)) as string;
        if (!sessionToken || sessionToken !== token) throw new BadRequestException("Invalid session token!");
    }
}