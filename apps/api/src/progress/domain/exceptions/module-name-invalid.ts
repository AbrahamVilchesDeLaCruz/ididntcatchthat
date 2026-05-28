import { DomainException } from '@/shared/domain/exceptions/domain-exception';

const MODULE_NAMES = [
  'native_sounds',
  'connecting_words',
  'beautifying_sentences',
  'sounding_native',
] as const;

export class ModuleNameInvalid extends DomainException {
  constructor(value: string) {
    super(
      `ModuleName value <${value}> is invalid. Must be one of: ${MODULE_NAMES.join(', ')}`,
    );
  }
}
