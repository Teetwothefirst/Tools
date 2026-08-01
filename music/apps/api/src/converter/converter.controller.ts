import { Controller, Post, Get, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ConverterService } from './converter.service';

@ApiTags('Media Converter')
@Controller('converter')
export class ConverterController {
  constructor(private readonly converterService: ConverterService) {}

  @Get('formats')
  @ApiOperation({ summary: 'Get supported media conversion formats' })
  getSupportedFormats() {
    return {
      inputs: ['MP4', 'MKV', 'AVI', 'MOV', 'WEBM', 'WAV', 'MP3', 'M4A', 'FLAC', 'OGG', 'AAC'],
      outputs: [
        { format: 'mp3', label: 'MP3 (Audio)', type: 'audio', description: 'Universal compressed audio stream' },
        { format: 'wav', label: 'WAV (Uncompressed Audio)', type: 'audio', description: 'Studio quality uncompressed PCM audio' },
        { format: 'aac', label: 'AAC (M4A Audio)', type: 'audio', description: 'Advanced audio coding for Apple/Web' },
        { format: 'flac', label: 'FLAC (Lossless Audio)', type: 'audio', description: 'Lossless compressed audio' },
        { format: 'mp4', label: 'MP4 (Video)', type: 'video', description: 'Standard Web & Mobile video container' },
        { format: 'webm', label: 'WEBM (Web Video)', type: 'video', description: 'HTML5 optimized video container' },
      ],
      bitrates: ['128k', '192k', '256k', '320k'],
    };
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert video/audio file from one media format to another (e.g. MP4 to MP3)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        targetFormat: { type: 'string', example: 'mp3' },
        bitrate: { type: 'string', example: '192k' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async convertMedia(
    @UploadedFile() file: Express.Multer.File,
    @Body('targetFormat') targetFormat: 'mp3' | 'wav' | 'aac' | 'flac' | 'mp4' | 'webm' = 'mp3',
    @Body('bitrate') bitrate: string = '192k'
  ) {
    if (!file) {
      throw new BadRequestException('No media file uploaded for conversion');
    }

    const validFormats = ['mp3', 'wav', 'aac', 'flac', 'mp4', 'webm'];
    const fmt = targetFormat?.toLowerCase() as any;
    if (!validFormats.includes(fmt)) {
      throw new BadRequestException(`Invalid target format: ${targetFormat}. Supported: ${validFormats.join(', ')}`);
    }

    const result = await this.converterService.convertMedia(file, fmt, bitrate || '192k');
    return {
      message: `Successfully converted ${file.originalname} to ${fmt.toUpperCase()}`,
      fileName: result.fileName,
      format: result.format,
      url: result.url,
      size: result.size,
      duration: result.duration,
    };
  }
}
