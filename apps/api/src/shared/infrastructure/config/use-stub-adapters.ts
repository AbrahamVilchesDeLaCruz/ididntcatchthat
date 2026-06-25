import { type ConfigService } from '@nestjs/config';

export function useStubAdapters(config?: ConfigService): boolean {
  if (config) {
    return config.get<boolean>('USE_STUB_ADAPTERS') === true;
  }
  return process.env.USE_STUB_ADAPTERS === 'true';
}
