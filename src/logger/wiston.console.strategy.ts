import { Logger } from 'winston';
import winston, { format, transports } from 'winston';
import { ILogStrategy } from './app.logger';

export class WistonConsoleLogStrategy implements ILogStrategy {
  private winstonLogger: Logger;

  constructor(options: { formatType?: 'json' | 'human'; colorsEnabled?: boolean } = {}) {
    this.winstonLogger = winston.createLogger({
      format: this.getLogFormat(options.formatType ?? 'json', options.colorsEnabled ?? false),
      transports: [new transports.Console()],
    });
  }

  private getLogFormat(formatType: 'json' | 'human', enableColors: boolean): winston.Logform.Format {
    const formats = [format.timestamp()];

    if (enableColors && formatType === 'human') {
      formats.push(format.colorize());
    }

    if (formatType === 'json') {
      formats.push(format.json());
    } else {
      formats.push(
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.entries(meta)
            .map(([key, value]) => `${key}=${this.stringifyValue(value)}`)
            .join(' ');
          return `${timestamp} ${level}: ${message} ${metaString}`;
        })
      );
    }

    return format.combine(...formats);
  }

  private stringifyValue(value: any): string {
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    return String(value);
  }

  public log(level: string, message: string, logAttributes: Record<string, any>): void {
    this.winstonLogger.log({
      level,
      message,
      ...logAttributes,
    });
  }
}
