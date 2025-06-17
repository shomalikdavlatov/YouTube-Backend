import { BadRequestException, Injectable } from '@nestjs/common';
import RedisService from 'src/core/database/redis.service';

@Injectable()
export default class OtpSecurityService {
  private maxAttempts: number = 3;
  private blockDuration: number = 3600;
  private attemptDuration: number = 3600;
  constructor(private redisService: RedisService) {}
  async recordFailedOtpAttempt(key: string) {
    const newKey = `otp-attempts:${key}`;
    const check = await this.redisService.redis.exists(newKey);
    await this.redisService.redis.incr(newKey);
    if (!check) {
      await this.redisService.redis.expire(newKey, this.attemptDuration);
    }
    const usedAttempts = +((await this.redisService.get(newKey)) as string);
    const leftAttempts: number = this.maxAttempts - usedAttempts;
    if (leftAttempts <= 0) await this.temporaryBlock(key, usedAttempts);
    return leftAttempts;
  }
  async temporaryBlock(key: string, attempts: number) {
    const date = Date.now();
    await this.redisService.set(
      `temporary-blocked:${key}`,
      this.blockDuration,
      JSON.stringify({
        blockedAt: date,
        attempts,
        reason: 'Too many attempts',
        unblockedAt: date + this.blockDuration * 1000,
      }),
    );
    await this.redisService.del(key);
  }
  async isTemporaryBlocked(key: string) {
    const newKey = `temporary-blocked:${key}`;
    if (await this.redisService.get(newKey))
      throw new BadRequestException({
        message: `You tried too much, please try again after ${Math.floor(await this.redisService.ttl(newKey))} minutes!`,
      });
  }
}
