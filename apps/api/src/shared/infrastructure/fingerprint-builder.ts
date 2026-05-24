import { Injectable } from '@nestjs/common';

/**
 * FingerprintBuilder — construye un fingerprint anónimo a partir de los
 * HTTP headers del request. Vive en infrastructure porque accede a datos
 * de transporte (headers, IP). Los use cases reciben el string directamente.
 */
@Injectable()
export class FingerprintBuilder {
  fromRequest(userAgent: string, acceptLanguage: string, ip: string): string {
    const raw = `${userAgent ?? ''}|${acceptLanguage ?? ''}|${ip ?? ''}`;
    return Buffer.from(raw).toString('base64');
  }
}
