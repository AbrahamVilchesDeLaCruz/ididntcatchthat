import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { GlobalExceptionRegistry } from './global-exception-registry';

@Catch()
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly registry: GlobalExceptionRegistry) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
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

    response.status(status).json({
      statusCode: status,
      message,
      errorType,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
