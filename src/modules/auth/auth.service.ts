import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
    constructor() {}
    async sendPhoneOtp() {}
    async verifyPhoneOtp() {}
    async sendEmailOtp() {}
    async verifyEmailOtp() {}
    async register() {}
    async login() {}
}
