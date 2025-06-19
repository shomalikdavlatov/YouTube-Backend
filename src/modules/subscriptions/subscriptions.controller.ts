import { Controller, Get, Query, Req } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import QueryDto from './dto/query.dto';
import { Request } from 'express';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}
  @Get()
  async getSubscriptions(@Query() query: QueryDto, @Req() request: Request) {
    if (!query) return await this.subscriptionsService.getSubscriptions(request['user'].userId, 20, 1);
    return await this.subscriptionsService.getSubscriptions(request['user'].userId, +(query.limit ? query.limit : 20), +(query.page ? query.page : 1));
  } 
}
