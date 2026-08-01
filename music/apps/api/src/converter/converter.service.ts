import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from 'ffmpeg-static';
import * as path from 'path';
import * as fs from 'fs';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ConverterService {
  private readonly logger = new Logger(ConverterService.name);

  constructor(private readonly storageService: StorageService) {
    if (ffmpegPath) {
      ffmpeg.setFfmpegPath(ffmpegPath);
      this.logger.log(`Initialized FFmpeg binary path: ${ffmpegPath}`);
    }
  }

  async convertMedia(
    file: Express.Multer.File,
    targetFormat: 'mp3' | 'wav' | 'aac' | 'flac' | 'mp4' | 'webm' = 'mp3',
    bitrate: string = '192k'
  ): Promise<{ url: string; fileName: string; format: string; size: number; duration: number }> {
    const tempDir = path.join(process.cwd(), 'temp-conversions');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const inputExt = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, inputExt);
    const inputPath = path.join(tempDir, `input-${Date.now()}${inputExt}`);
    const outputPath = path.join(tempDir, `${baseName}-converted-${Date.now()}.${targetFormat}`);

    // Save input buffer temporarily
    fs.writeFileSync(inputPath, file.buffer);

    return new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);

      if (['mp3', 'wav', 'aac', 'flac'].includes(targetFormat)) {
        // Audio conversion settings
        command = command
          .noVideo()
          .toFormat(targetFormat)
          .audioBitrate(bitrate)
          .audioChannels(2);
      } else if (['mp4', 'webm'].includes(targetFormat)) {
        // Video conversion settings
        command = command
          .toFormat(targetFormat)
          .videoCodec(targetFormat === 'webm' ? 'libvpx' : 'libx264')
          .audioCodec('aac');
      }

      command
        .on('start', (cmd) => {
          this.logger.log(`Executing FFmpeg command: ${cmd}`);
        })
        .on('end', async () => {
          try {
            const convertedBuffer = fs.readFileSync(outputPath);
            const stats = fs.statSync(outputPath);

            // Create pseudo Multer File for storage service
            const convertedFile: Express.Multer.File = {
              fieldname: 'file',
              originalname: `${baseName}.${targetFormat}`,
              encoding: '7bit',
              mimetype: this.getMimeType(targetFormat),
              buffer: convertedBuffer,
              size: stats.size,
              stream: null as any,
              destination: '',
              filename: '',
              path: '',
            };

            const bucket = ['mp4', 'webm'].includes(targetFormat) ? 'video-files' : 'audio-files';
            const uploadResult = await this.storageService.uploadFile(bucket, convertedFile);

            // Cleanup temp files
            try {
              if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
              if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (e) {}

            resolve({
              url: uploadResult.url,
              fileName: `${baseName}.${targetFormat}`,
              format: targetFormat,
              size: stats.size,
              duration: 180,
            });
          } catch (err: any) {
            this.logger.error('Failed to upload converted file', err);
            reject(new InternalServerErrorException('Failed to process converted media'));
          }
        })
        .on('error', (err) => {
          this.logger.error(`FFmpeg conversion error: ${err.message}`);
          try {
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          } catch (e) {}
          reject(new InternalServerErrorException(`Conversion failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  private getMimeType(format: string): string {
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      flac: 'audio/flac',
      mp4: 'video/mp4',
      webm: 'video/webm',
    };
    return mimeMap[format] || 'application/octet-stream';
  }
}
