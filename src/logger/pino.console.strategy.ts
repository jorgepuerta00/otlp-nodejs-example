import { pino } from 'pino';
import { ILogStrategy } from './app.logger';
import type { LokiOptions } from 'pino-loki'

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

    this.logger = pino({
      level: options.level ?? 'info', 
    }, transport);
  }

  public log(level: LogLevel, message: string, logAttributes: Record<string, any>): void {
    this.logger[level]({ message, ...logAttributes });
  }
}
