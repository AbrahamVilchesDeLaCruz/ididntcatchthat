import {
  Inject,
  Injectable,
  type NestInterceptor,
  type ExecutionContext,
  type CallHandler,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { Counter, Histogram, Registry } from 'prom-client';
import { type Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { METRICS_REGISTRY } from '@/shared/domain/metrics-registry';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private readonly requestsTotal: Counter;
  private readonly requestDuration: Histogram;

  constructor(@Inject(METRICS_REGISTRY) registry: Registry) {
    this.requestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [registry],
    });

    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [registry],
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const method = request.method;
    type RouteShape = { path: string };
    const rawRoute = (request as unknown as { route?: RouteShape }).route;
    const route: string = rawRoute?.path ?? request.path;
    const end = this.requestDuration.startTimer({ method, route });

    return next.handle().pipe(
      finalize(() => {
        const statusCode = String(response.statusCode);
        this.requestsTotal.inc({ method, route, status_code: statusCode });
        end({ status_code: statusCode });
      }),
    );
  }
}
