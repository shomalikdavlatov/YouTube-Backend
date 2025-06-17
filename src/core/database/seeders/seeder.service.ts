import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import PrismaService from '../prisma.service';
import bcrypt from 'bcrypt';

@Injectable()
export default class SeederService implements OnModuleInit {
  private readonly logger: Logger = new Logger("Seeder");
  constructor(private prismaService: PrismaService) {}
  async seedAll() {
    await this.seedUsers()
  }
  async seedUsers() {
    const phoneNumber = process.env.SUPERADMIN_PHONE_NUMBER;
    const superadmin = await this.prismaService.prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (!superadmin) {
      const password = await bcrypt.hash(
        process.env.SUPERADMIN_PASSWORD as string,
        +(process.env.HASH as string),
      );
      await this.prismaService.prisma.user.create({
        data: {
          phoneNumber: phoneNumber as string,
          username: process.env.SUPERADMIN_USERNAME as string,
          password,
          firstName: process.env.SUPERADMIN_FIRST_NAME as string,
          lastName: process.env.SUPERADMIN_LAST_NAME as string,
          role: 'SUPERADMIN',
        },
      }); 
      this.logger.log("Superadmin created!");
    }
  }
  async onModuleInit() {
    await this.seedAll(); 
  }
}
