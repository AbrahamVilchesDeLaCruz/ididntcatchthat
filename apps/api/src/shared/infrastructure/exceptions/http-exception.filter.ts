import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { type Logger, LOGGER_SERVICE } from '@/shared/domain/logger';
import { GlobalExceptionRegistry } from './global-exception-registry';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly registry: GlobalExceptionRegistry,
    @Inject(LOGGER_SERVICE) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';
    let errorType: string | null = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      const registered = this.registry.getStatusCode(
        exception.constructor.name,
      );
      if (registered !== undefined) status = registered;
      message = exception.message;
      errorType = exception.constructor.name;
    }

    const logContext = {
      status,
      path: request.url,
      method: request.method,
      errorType,
    };

    const statusCode = status;

    if (statusCode >= 500) {
      // Unexpected error — always log with full stack trace
      this.logger.error(
        'Unhandled exception',
        exception instanceof Error ? exception : undefined,
        logContext,
      );
    } else if (statusCode >= 400 && errorType !== null) {
      // Domain exception — use its own message as the log message
      this.logger.warn(
        exception instanceof Error ? exception.message : 'Domain error',
        logContext,
      );
    } else if (statusCode >= 400) {
      // 4xx from NestJS itself (ValidationPipe, manual HttpException)
      const msg = typeof message === 'string' ? message : 'HTTP client error';
      this.logger.warn(msg, logContext);
    }

    response.status(status).json({
      statusCode: status,
      message,
      errorType,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
