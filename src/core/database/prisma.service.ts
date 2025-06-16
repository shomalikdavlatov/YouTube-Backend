import { Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

export default class PrismaService implements OnModuleInit, OnModuleDestroy{
    private readonly logger: Logger = new Logger("Prisma");
    public prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }
    async onModuleInit() {
        try {
            await this.prisma.$connect();
            this.logger.log("Connected!");
        } catch(error) {
            this.logger.error(error.message);
        }
    }
    async onModuleDestroy() {
        await this.prisma.$disconnect();
        process.exit(1);
    }
}