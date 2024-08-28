import { pino } from 'pino';
import { ILogStrategy } from './app.logger';
import type { LokiOptions } from 'pino-loki';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface PinoLogStrategyOptions {
  host: string;
  level?: LogLevel;
}

export class PinoConsoleLogStrategy implements ILogStrategy {
  private logger: pino.Logger;

  constructor(applicationName: string, options: PinoLogStrategyOptions) {
    const transport = pino.transport<LokiOptions>({
      target: 'pino-loki',
      options: {
        batching: true,
        interval: 2,
        host: options.host,
        labels: { application: applicationName },
      },
    });

    this.logger = pino(
      {
        level: options.level ?? 'info',
      },
      transport
    );
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
      const pre = prefix.length ? `${prefix}.` : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, this.flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = String(obj[k]);
      }
      return acc;
    }, {} as Record<string, string>);
  }

  public log(level: LogLevel, message: string, logAttributes: Record<string, any>): void {
    const flattenedAttributes = this.flattenObject(logAttributes);
    const logData = {
      level,
      message,
      ...flattenedAttributes,
    };

    this.logger[level](logData);
  }
}
