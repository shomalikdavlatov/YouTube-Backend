import { Module } from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import DatabaseModule from "./database/database.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ".env",
            isGlobal: true
        }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            global: true,
            useFactory: (configService: ConfigService) => ({
                secret: configService.get("JWT_SECRET"),
                signOptions: {
                    expiresIn: "4h"
                }
            }),
            inject: [ConfigService]
        }),
        DatabaseModule
    ]
})
export default class CoreModule {

}