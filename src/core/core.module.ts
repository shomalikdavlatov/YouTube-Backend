import { DynamicModule, Global, Module } from "@nestjs/common";
import {ConfigModule, ConfigService} from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import DatabaseModule from "./database/database.module";
import { ResendModule } from "nestjs-resend";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import VideoService from "./video.service";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '4h',
        },
      }),
      inject: [ConfigService],
    }),
    ResendModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get('RESEND_API_KEY') as string,
      }),
      inject: [ConfigService],
    }) as DynamicModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..'),
      serveRoot: '/',
    }),
    DatabaseModule,
  ],
  providers: [VideoService],
  exports: [VideoService]
})
export default class CoreModule {}