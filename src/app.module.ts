import { Module } from '@nestjs/common';
import { VideosModule } from './modules/videos/videos.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PlaylistsModule } from './modules/playlists/playlists.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [VideosModule, AuthModule, ChannelsModule, SubscriptionsModule, CommentsModule, PlaylistsModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
