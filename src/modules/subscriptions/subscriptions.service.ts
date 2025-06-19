import { Injectable } from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';

@Injectable()
export class SubscriptionsService {
    constructor(private prismaService: PrismaService) {}
    async getSubscriptions(id: string, limit: number, page: number) {
        return await this.prismaService.prisma.subscription.findMany({where: {subscriberId: id}, include: {channel: true}, skip: (page-1) * limit, take: limit});
    }
}
