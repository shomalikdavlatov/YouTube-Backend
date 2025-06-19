import { IsOptional, IsString } from "class-validator";

export default class QueryDto {
    @IsOptional()
    @IsString()
    limit: string;
    @IsOptional()
    @IsString()
    page: string;
}