import { Injectable } from '@nestjs/common';
import pino, { type Logger as PinoInstance } from 'pino';
import { type LogContext, type Logger } from '@/shared/domain/logger';

@Injectable()
export class PinoLogger implements Logger {
  private readonly logger: PinoInstance;

  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    const lokiUrl = process.env.LOKI_URL;
    const level = process.env.LOG_LEVEL ?? 'info';

    this.logger = pino(
      {
        level,
        formatters: {
          level: (label) => ({ level: label }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.transport({
        targets: [
          // ─── stdout ──────────────────────────────────────────────────────────
          isDev
            ? {
                target: 'pino-pretty',
                level,
                options: {
                  colorize: true,
                  translateTime: 'SYS:HH:MM:ss',
                  ignore: 'pid,hostname',
                },
              }
            : {
                target: 'pino/file',
                level,
                options: { destination: 1 }, // stdout
              },

          // ─── Loki (solo si LOKI_URL está definida) ───────────────────────────
          ...(lokiUrl
            ? [
                {
                  target: 'pino-loki',
                  level,
                  options: {
                    host: lokiUrl,
                    labels: {
                      app: 'ididntcatchthat-api',
                      env: process.env.NODE_ENV ?? 'development',
                    },
                    replaceTimestamp: true,
                    silenceErrors: false,
                  },
                },
              ]
            : []),
        ],
      }),
    );
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(context ?? {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(context ?? {}, message);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.logger.error({ ...context, err: error }, message);
  }

  debug(message: string, context?: LogContext): void {
    this.logger.debug(context ?? {}, message);
  }
}
