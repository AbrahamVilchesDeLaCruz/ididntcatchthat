import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { type AudioStorage } from '@/content/flashcard/domain/audio-storage';

@Injectable()
export class R2AudioStorage implements AudioStorage {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.getOrThrow<string>('CLOUD_STORAGE');
    this.bucket = this.config.getOrThrow<string>('CLOUD_STORAGE_BUCKET');
    this.publicUrl = this.config.getOrThrow<string>('CLOUD_STORAGE_PUBLIC_URL');

    const isLocalEndpoint =
      endpoint.includes('localhost') || endpoint.includes('127.0.0.1');

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      forcePathStyle: isLocalEndpoint,
      credentials: {
        accessKeyId: this.config.getOrThrow<string>(
          'CLOUD_STORAGE_ACCESS_KEY_ID',
        ),
        secretAccessKey: this.config.getOrThrow<string>(
          'CLOUD_STORAGE_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async upload(
    key: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return `${this.publicUrl}/${this.bucket}/${key}`;
  }
}
