import { Body, Controller, Delete, Get, Param, Post, Put, Req, SetMetadata, UseGuards } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Request } from 'express';
import RoleGuard from 'src/common/guards/role.guard';
import UpdateChannelDto from './dto/update-channel.dto';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}
  @Get(':username')
  async getInfo(@Param('username') username: string, @Req() request: Request) {
    return await this.channelsService.getInfo(username, request['user'].userId);
  }
  @Put("me")
  async updateChannel(@Body() body: UpdateChannelDto, @Req() request: Request) {
    return await this.channelsService.updateChannel(request['user'].userId, body);
  }
  @Post(":userId/subscribe")
  async subscribe(@Param('userId') id: string, @Req() request: Request) {
    return await this.channelsService.subscribe(id, request['user'].userId);
  }
  @Delete(":userId/unsubscribe")
  async unsubscribe(@Param('userId') id: string, @Req() request: Request) {
    return await this.channelsService.unsubscribe(id, request['user'].userId);
  }
}
