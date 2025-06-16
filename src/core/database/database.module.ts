import { Global, Module } from "@nestjs/common";
import PrismaService from "./prisma.service";
import RedisService from "./redis.service";
import SeederModule from "./seeders/seeder.module";

@Global()
@Module({
    imports: [SeederModule],
    providers: [PrismaService, RedisService],
    exports: [PrismaService, RedisService]
})
export default class DatabaseModule {}