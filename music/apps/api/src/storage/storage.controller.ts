import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload/audio')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload audio file (.mp3, .wav, .m4a, .flac) to Supabase Storage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAudio(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    const allowedMime = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/ogg', 'audio/aac', 'audio/mp4', 'audio/m4a'];
    if (!allowedMime.some((m) => file.mimetype.includes(m))) {
      // Gentle mime fallback for audio files
      if (!file.originalname.match(/\.(mp3|wav|m4a|flac|ogg|aac)$/i)) {
        throw new BadRequestException('Invalid audio file format. Supported: .mp3, .wav, .m4a, .flac, .ogg');
      }
    }

    const result = await this.storageService.uploadFile('audio-files', file);
    return {
      message: 'Audio file uploaded successfully',
      url: result.url,
      path: result.path,
      size: file.size,
    };
  }

  @Post('upload/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload cover art or avatar image (.png, .jpg, .webp) to Supabase Storage' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Must be an image');
    }

    const result = await this.storageService.uploadFile('album-covers', file);
    return {
      message: 'Image uploaded successfully',
      url: result.url,
      path: result.path,
      size: file.size,
    };
  }
}
