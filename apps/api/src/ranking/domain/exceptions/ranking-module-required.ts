import { DomainException } from '@/shared/domain/exceptions/domain-exception';

export class RankingModuleRequired extends DomainException {
  constructor() {
    super('module query param is required for module_master ranking');
  }
}
