import { type ExecutionContext } from '@nestjs/common';
import { Registry } from 'prom-client';
import { lastValueFrom, of } from 'rxjs';
import { MetricsInterceptor } from '@/observability/infrastructure/framework/metrics.interceptor';

describe('observability/infrastructure MetricsInterceptor', () => {
  it('should record http_requests_total and http_request_duration_seconds on finalize', async () => {
    const registry = new Registry();
    const interceptor = new MetricsInterceptor(registry);

    const request = {
      method: 'GET',
      path: '/v1/games',
      route: { path: '/v1/games' },
    };
    const response = { statusCode: 200 };

    const context = {
      switchToHttp: (): {
        getRequest: () => typeof request;
        getResponse: () => typeof response;
      } => ({
        getRequest: (): typeof request => request,
        getResponse: (): typeof response => response,
      }),
    } as ExecutionContext;

    await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of('ok'),
      }),
    );

    const metricsJson = await registry.getMetricsAsJSON();
    const httpTotal = metricsJson.find((m) => m.name === 'http_requests_total');
    const duration = metricsJson.find(
      (m) => m.name === 'http_request_duration_seconds',
    );

    expect(httpTotal?.values?.[0]).toMatchObject({
      labels: { method: 'GET', route: '/v1/games', status_code: '200' },
      value: 1,
    });
    expect(duration?.values?.length).toBeGreaterThan(0);
  });

  it('should fall back to request.path when route is undefined', async () => {
    const registry = new Registry();
    const interceptor = new MetricsInterceptor(registry);

    const request = {
      method: 'POST',
      path: '/v1/auth/login',
    };
    const response = { statusCode: 401 };

    const context = {
      switchToHttp: (): {
        getRequest: () => typeof request;
        getResponse: () => typeof response;
      } => ({
        getRequest: (): typeof request => request,
        getResponse: (): typeof response => response,
      }),
    } as ExecutionContext;

    await lastValueFrom(
      interceptor.intercept(context, {
        handle: () => of('ok'),
      }),
    );

    const metricsJson = await registry.getMetricsAsJSON();
    const httpTotal = metricsJson.find((m) => m.name === 'http_requests_total');

    expect(httpTotal?.values?.[0]).toMatchObject({
      labels: {
        method: 'POST',
        route: '/v1/auth/login',
        status_code: '401',
      },
      value: 1,
    });
  });
});
