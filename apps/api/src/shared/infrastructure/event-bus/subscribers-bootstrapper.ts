import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type Subscriber } from '@/shared/application/subscriber';

export const SUBSCRIBERS = Symbol('Subscribers');

@Injectable()
export class SubscribersBootstrapper implements OnModuleInit {
  constructor(
    @Inject(SUBSCRIBERS) private readonly subscribers: Subscriber[],
  ) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(this.subscribers.map((s) => s.init()));
  }
}
