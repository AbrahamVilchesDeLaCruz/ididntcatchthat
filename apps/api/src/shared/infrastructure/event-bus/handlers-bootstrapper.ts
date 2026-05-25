import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type Handler } from '@/shared/application/handler';

export const HANDLERS = Symbol('Handlers');

@Injectable()
export class HandlersBootstrapper implements OnModuleInit {
  constructor(@Inject(HANDLERS) private readonly handlers: Handler[]) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(this.handlers.map((h) => h.init()));
  }
}
