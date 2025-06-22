import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { Request } from 'express';
import UpdateProfileDto from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get('me')
  async getProfile(@Req() request: Request) {
    return await this.usersService.getProfile(request['user'].userId);
  }
  @Put('me')
  async updateProfile(@Req() request: Request, @Body() body: UpdateProfileDto) {
    return await this.usersService.updateProfile(request['user'].userId, body); 
  }
}
