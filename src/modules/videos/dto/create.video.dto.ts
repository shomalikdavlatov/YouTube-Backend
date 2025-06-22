import { IsEnum, IsOptional, IsString } from "class-validator";

export default class CreateVideoDto {
    @IsString()
    title: string;
    @IsString()
    @IsOptional()
    description?: string;
    @IsEnum({ PUBLIC: "PUBLIC", UNLISTED: "UNLISTED", PRIVATE: 'PRIVATE'})
    @IsOptional()
    visibility?: "PUBLIC" | "UNLISTED" | "PRIVATE";
}