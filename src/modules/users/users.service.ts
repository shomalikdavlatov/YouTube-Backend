import { Injectable } from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import UpdateProfileDto from './dto/update-profile.dto';

@Injectable()
export class UsersService {
    constructor(private prismaService: PrismaService) {}
    async getProfile(id: string) {
        return await this.prismaService.prisma.user.findFirst({where: {id}, select: {username: true, email: true, phoneNumber: true, firstName: true, lastName: true }});
    }
    async updateProfile(id: string, body: UpdateProfileDto) {}
}
