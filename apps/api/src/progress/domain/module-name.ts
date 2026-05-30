import { StringValueObject } from '@/shared/domain/string-value-object';
import { ModuleNameInvalid } from '@/progress/domain/exceptions/module-name-invalid';

const MODULE_NAMES = [
  'native_sounds',
  'connecting_words',
  'beautifying_sentences',
  'sounding_native',
] as const;

export type ModuleNameValue = (typeof MODULE_NAMES)[number];

export class ModuleName extends StringValueObject {
  public constructor(value: ModuleNameValue) {
    super(value);
  }

  static create(value: string): ModuleName {
    if (!MODULE_NAMES.includes(value as ModuleNameValue)) {
      throw new ModuleNameInvalid(value);
    }
    return new ModuleName(value as ModuleNameValue);
  }

  static values(): readonly string[] {
    return MODULE_NAMES;
  }
}
