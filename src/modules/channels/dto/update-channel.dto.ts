import { IsOptional, IsString } from "class-validator";

export default class UpdateChannelDto {
  @IsOptional()
  @IsString()
  channelName?: string;
  @IsOptional()
  @IsString()
  channelDescription?: string;
}
