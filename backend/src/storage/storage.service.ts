import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('SUPABASE_URL'),
      this.config.get<string>('SUPABASE_SERVICE_KEY'),
    );
    this.bucket = this.config.get<string>('SUPABASE_BUCKET');
  }

  private sanitizeFilename(filename: string): string {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w.\-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

  async upload(
    buffer: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<string> {
    // Generate unique filename to avoid collisions
    const sanitized = this.sanitizeFilename(filename);
    const uniqueName = `${Date.now()}-${sanitized}`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(uniqueName, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Storage upload failed: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(uniqueName);

    return data.publicUrl;
  }

  async delete(url: string): Promise<void> {
    // Extract filename from URL
    const parts = url.split(`${this.bucket}/`);
    if (parts.length < 2) return;

    const path = parts[1];
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([path]);

    if (error) {
      throw new InternalServerErrorException(
        `Storage delete failed: ${error.message}`,
      );
    }
  }
}