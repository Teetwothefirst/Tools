import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { StorageService } from '../storage/storage.service';

const execAsync = promisify(exec);

export type MediaTargetFormat = 'mp3' | 'wav' | 'aac' | 'flac' | 'm4a' | 'ogg' | 'mp4' | 'webm';

@Injectable()
export class ConverterService {
  private readonly logger = new Logger(ConverterService.name);
  private ffmpegBinary: string = 'ffmpeg';

  constructor(private readonly storageService: StorageService) {
    this.initFfmpegPath();
  }

  private initFfmpegPath() {
    try {
      const ffmpegStatic = require('ffmpeg-static');
      const exePath = typeof ffmpegStatic === 'string' ? ffmpegStatic : (ffmpegStatic?.path || ffmpegStatic?.default);
      if (exePath && fs.existsSync(exePath)) {
        this.ffmpegBinary = `"${exePath}"`;
        this.logger.log(`Using ffmpeg-static module at: ${exePath}`);
        return;
      }
    } catch (e) {}

    // Search directory tree for ffmpeg.exe
    let searchDir = process.cwd();
    for (let i = 0; i < 5; i++) {
      const direct = path.join(searchDir, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
      if (fs.existsSync(direct)) {
        this.ffmpegBinary = `"${direct}"`;
        this.logger.log(`Found ffmpeg-static binary at: ${direct}`);
        return;
      }

      const pnpmDir = path.join(searchDir, 'node_modules', '.pnpm');
      if (fs.existsSync(pnpmDir)) {
        try {
          const entries = fs.readdirSync(pnpmDir);
          for (const entry of entries) {
            if (entry.includes('ffmpeg-static')) {
              const pnpmExe = path.join(pnpmDir, entry, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
              if (fs.existsSync(pnpmExe)) {
                this.ffmpegBinary = `"${pnpmExe}"`;
                this.logger.log(`Found FFmpeg pnpm binary at: ${pnpmExe}`);
                return;
              }
            }
          }
        } catch (e) {}
      }

      const parent = path.dirname(searchDir);
      if (parent === searchDir) break;
      searchDir = parent;
    }

    this.ffmpegBinary = 'ffmpeg';
    this.logger.warn('Defaulting to system "ffmpeg" CLI path.');
  }

  async convertMedia(
    file: any,
    targetFormat: string = 'mp3',
    bitrate: string = '192k'
  ): Promise<{ url: string; fileName: string; format: string; size: number; duration: number }> {
    // Re-verify FFmpeg binary path before execution
    if (this.ffmpegBinary === 'ffmpeg') {
      this.initFfmpegPath();
    }

    const tempDir = path.join(process.cwd(), 'temp-conversions');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const fmt = targetFormat.toLowerCase();
    const inputExt = path.extname(file.originalname || 'input.mp4');
    const baseName = path.basename(file.originalname || 'file', inputExt);
    const timeId = Date.now();
    const inputPath = path.join(tempDir, `input-${timeId}${inputExt}`);
    const outputPath = path.join(tempDir, `${baseName}-converted-${timeId}.${fmt}`);

    // Write uploaded buffer to disk
    fs.writeFileSync(inputPath, file.buffer);

    let ffmpegCmd = '';
    switch (fmt) {
      case 'mp3':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -vn -c:a libmp3lame -b:a ${bitrate} "${outputPath}"`;
        break;
      case 'wav':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -vn -c:a pcm_s16le "${outputPath}"`;
        break;
      case 'aac':
      case 'm4a':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -vn -c:a aac -b:a ${bitrate} "${outputPath}"`;
        break;
      case 'flac':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -vn -c:a flac "${outputPath}"`;
        break;
      case 'ogg':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -vn -c:a libvorbis -b:a ${bitrate} "${outputPath}"`;
        break;
      case 'mp4':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -c:v libx264 -c:a aac -b:a ${bitrate} "${outputPath}"`;
        break;
      case 'webm':
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -c:v libvpx -c:a libvorbis -b:a ${bitrate} "${outputPath}"`;
        break;
      default:
        ffmpegCmd = `${this.ffmpegBinary} -y -i "${inputPath}" -vn -b:a ${bitrate} "${outputPath}"`;
    }

    this.logger.log(`Executing conversion command: ${ffmpegCmd}`);

    try {
      await execAsync(ffmpegCmd);

      if (!fs.existsSync(outputPath)) {
        throw new Error('Converted output file was not generated');
      }

      const convertedBuffer = fs.readFileSync(outputPath);
      const stats = fs.statSync(outputPath);

      const convertedFile: any = {
        fieldname: 'file',
        originalname: `${baseName}.${fmt}`,
        encoding: '7bit',
        mimetype: this.getMimeType(fmt),
        buffer: convertedBuffer,
        size: stats.size,
      };

      const bucket = ['mp4', 'webm'].includes(fmt) ? 'video-files' : 'audio-files';
      const uploadResult = await this.storageService.uploadFile(bucket, convertedFile);

      // Clean up temp files
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (e) {}

      return {
        url: uploadResult.url,
        fileName: `${baseName}.${fmt}`,
        format: fmt,
        size: stats.size,
        duration: 180,
      };
    } catch (err: any) {
      this.logger.error(`FFmpeg execution error: ${err.message}`);
      
      // Clean up temp files on failure
      try {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch (e) {}

      if (err.message?.includes('not recognized') || err.message?.includes('ENOENT')) {
        this.logger.warn(`FFmpeg binary not found on system PATH. Please run 'pnpm install' or install FFmpeg CLI.`);
        throw new InternalServerErrorException(
          `Media conversion engine requires FFmpeg binary. Please install FFmpeg or run 'pnpm install' in the music project directory.`
        );
      }

      throw new InternalServerErrorException(
        `Media conversion failed (${fmt.toUpperCase()}): ${err.message}`
      );
    }
  }

  private getMimeType(format: string): string {
    const mimeMap: Record<string, string> = {
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      flac: 'audio/flac',
      m4a: 'audio/aac',
      ogg: 'audio/ogg',
      mp4: 'video/mp4',
      webm: 'video/webm',
    };
    return mimeMap[format] || 'application/octet-stream';
  }
}
