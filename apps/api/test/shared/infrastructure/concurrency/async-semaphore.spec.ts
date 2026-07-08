import { AsyncSemaphore } from '@/shared/infrastructure/concurrency/async-semaphore';

describe('shared/infrastructure/concurrency AsyncSemaphore', () => {
  it('should limit concurrent executions to max', async () => {
    const semaphore = new AsyncSemaphore(2);
    let active = 0;
    let peak = 0;

    const task = async (): Promise<void> => {
      await semaphore.run(async () => {
        active += 1;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 20));
        active -= 1;
      });
    };

    await Promise.all([task(), task(), task(), task()]);

    expect(peak).toBeLessThanOrEqual(2);
  });
});
