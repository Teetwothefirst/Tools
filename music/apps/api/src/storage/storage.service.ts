import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private supabase: any = null;
  private supabaseUrl: string;

  constructor(private configService: ConfigService) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL', 'https://nlgodkhqfmqapwiyiefc.supabase.co');
    const supabaseKey = this.configService.get<string>('SUPABASE_KEY', '');

    if (this.supabaseUrl && supabaseKey) {
      try {
        const { createClient } = require('@supabase/supabase-js');
        this.supabase = createClient(this.supabaseUrl, supabaseKey);
      } catch (e: any) {
        this.logger.warn(`Supabase JS SDK not installed in node_modules: ${e.message}`);
      }
    }
  }

  async uploadFile(bucketName: string, file: any): Promise<{ url: string; path: string }> {
    const fileExt = path.extname(file.originalname || 'file').toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${fileExt}`;

    try {
      if (this.supabase) {
        // Attempt upload to Supabase Storage Bucket
        const { data, error } = await this.supabase.storage
          .from(bucketName)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (!error && data) {
          const publicUrlData = this.supabase.storage.from(bucketName).getPublicUrl(fileName);
          this.logger.log(`Uploaded ${file.originalname} to Supabase bucket: ${bucketName}`);
          return { url: publicUrlData.data.publicUrl, path: data.path };
        } else {
          this.logger.warn(`Supabase bucket error (${bucketName}): ${error?.message}. Using local storage fallback.`);
        }
      }
    } catch (err: any) {
      this.logger.warn(`Supabase Storage unavailable, using local static fallback: ${err.message}`);
    }

    // Local Storage Fallback (stores in public upload directory)
    const uploadsDir = path.join(process.cwd(), 'uploads', bucketName);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localFilePath, file.buffer);

    const localUrl = `http://localhost:4000/uploads/${bucketName}/${fileName}`;
    return { url: localUrl, path: fileName };
  }
}
