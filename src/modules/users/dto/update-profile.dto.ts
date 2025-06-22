import { IsOptional, IsString, Length } from 'class-validator';

export default class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  first_name: string;
  @IsOptional()
  @IsString()
  @Length(1, 50)
  last_name: string;
}
