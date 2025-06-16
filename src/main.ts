import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import AuthGuard from './common/guards/auth.guard';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.useGlobalGuards(app.get(AuthGuard));
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
