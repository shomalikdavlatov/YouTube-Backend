import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import PrismaService from 'src/core/database/prisma.service';
import UpdateChannelDto from './dto/update-channel.dto';

@Injectable()
export class ChannelsService {
  constructor(private prismaService: PrismaService) {}
  async getInfo(username: string, userId: string) {
    const channel = await this.prismaService.prisma.user.findFirst({
      where: { username },
    });
    if (!channel)
      throw new NotFoundException(
        'Channel with the specified username not found!',
      );
    const requester = await this.prismaService.prisma.user.findFirst({
      where: { id: userId },
    });
    const subscription = await this.prismaService.prisma.subscription.findFirst(
      { where: { subscriberId: userId, channelId: channel.id } },
    );
    return {
      id: channel.id,
      channelName: channel.username,
      channelDescription: channel.channelDescription,
      channelBanner: channel.channelBanner,
      subscribersCount: channel.subscribersCount,
      totalViews: channel.totalViews,
      videosCount: channel.videosCount,
      joinedAt: subscription?.createdAt,
      isSubscribed: subscription ? true : false,
    };
  }
  async updateChannel(id: string, body: UpdateChannelDto) {
    if (body.channelName) {
      const channel = await this.prismaService.prisma.user.findFirst({
        where: { username: body.channelName },
      });
      if (channel)
        throw new ConflictException('Provided channel name is already exists!');
      await this.prismaService.prisma.user.update({
        where: { id },
        data: { username: body.channelName },
      });
    }
    if (body.channelDescription)
      await this.prismaService.prisma.user.update({
        where: { id },
        data: { channelDescription: body.channelDescription },
      });
    return { message: 'Channel updated successfully' };
  }
  async subscribe(channelId: string, id: string) {
    if (channelId === id) throw new BadRequestException("You can not subscribe to your own channel")
    const user = await this.prismaService.prisma.user.findFirst({
      where: { id: channelId },
    });
    if (!user)
      throw new NotFoundException('Channel with the specified id not found!');
    const subscription = await this.prismaService.prisma.subscription.findFirst(
      { where: { channelId, subscriberId: id } },
    );
    if (subscription)
      throw new BadRequestException(
        'You have already subscribed to this channel!',
      );
    await this.prismaService.prisma.subscription.create({
      data: { channelId, subscriberId: id },
    });
    return { message: 'Subscribed to channel successfully!' };
  }
  async unsubscribe(channelId: string, id: string) {
    if (channelId === id) throw new BadRequestException("You can not unsubscribe your own channel")
    const user = await this.prismaService.prisma.user.findFirst({
      where: { id: channelId },
    });
    if (!user)
      throw new NotFoundException('Channel with the specified id not found!');
    const subscription = await this.prismaService.prisma.subscription.findFirst(
      { where: { channelId, subscriberId: id } },
    );
    if (!subscription)
      throw new BadRequestException('You have not subscribed to this channel!');
    await this.prismaService.prisma.subscription.delete({
      where: { id: subscription.id },
    });
    return { message: 'Unsubscribed channel successfully' };
  }
}
