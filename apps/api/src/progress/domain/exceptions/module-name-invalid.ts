import { DomainException } from '@/shared/domain/exceptions/domain-exception';
import { LEARNING_MODULES } from '@/shared/domain/learning-module';

export class ModuleNameInvalid extends DomainException {
  constructor(value: string) {
    super(
      `ModuleName value <${value}> is invalid. Must be one of: ${LEARNING_MODULES.join(', ')}`,
    );
  }
}
