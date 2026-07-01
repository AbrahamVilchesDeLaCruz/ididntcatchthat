import { StringValueObject } from '@/shared/domain/string-value-object';
import { FingerprintEmptyException } from './exceptions/fingerprint-empty.exception';

/**
 * Fingerprint — identifica el dispositivo/browser de forma anónima.
 * Se construye desde HTTP headers: User-Agent + Accept-Language + IP.
 * Formato: base64url string no vacío.
 */
export class Fingerprint extends StringValueObject {
  constructor(value: string) {
    super(value);
    if (!value?.trim()) throw new FingerprintEmptyException();
  }
}
