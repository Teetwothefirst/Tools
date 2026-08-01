import { IsOptional, IsString } from 'class-validator';

export class ConvertMediaDto {
  @IsOptional()
  @IsString()
  targetFormat?: string;

  @IsOptional()
  @IsString()
  bitrate?: string;
}
