import { Module } from '@nestjs/common';
import { VideosModule } from './modules/videos/videos.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { UsersModule } from './modules/users/users.module';
import CoreModule from './core/core.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import TransformInterceptor from './common/interceptors/transform.interceptor';
import AuthGuard from './common/guards/auth.guard';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
    }),
    VideosModule,
    AuthModule,
    ChannelsModule,
    SubscriptionsModule,
    CommentsModule,
    PlaylistsModule,
    UsersModule,
    CoreModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    AuthGuard,
  ],
})
export class AppModule {}
