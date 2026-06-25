import { StringValueObject } from '@/shared/domain/string-value-object';
import {
  LEARNING_MODULES,
  type LearningModule,
} from '@/shared/domain/learning-module';
import { ModuleNameInvalid } from './exceptions/module-name-invalid';

export type ModuleNameValue = LearningModule;

export class ModuleName extends StringValueObject {
  private static readonly VALID_VALUES = new Set<string>(LEARNING_MODULES);

  constructor(value: string) {
    super(value);
    this.ensureModuleNameIsValid(value);
  }

  static create(value: string): ModuleName {
    return new ModuleName(value);
  }

  private ensureModuleNameIsValid(value: string): void {
    if (!ModuleName.VALID_VALUES.has(value)) throw new ModuleNameInvalid(value);
  }
}

export const MODULE_NAMES = LEARNING_MODULES;
