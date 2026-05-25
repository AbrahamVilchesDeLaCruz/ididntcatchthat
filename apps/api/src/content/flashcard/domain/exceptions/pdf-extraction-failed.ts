import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class PdfExtractionFailed extends DomainException {
  constructor() {
    super(`PDF extraction failed`);
  }
}
