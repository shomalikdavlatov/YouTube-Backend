import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Visibility } from '@prisma/client';

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  title?: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsEnum(Visibility, {
    message: 'Visibility must be PUBLIC, UNLISTED, or PRIVATE',
  })
  visibility?: Visibility;
}
