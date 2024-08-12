import { LoggerProvider } from '@opentelemetry/sdk-logs';
import { CustomLogger, ILogStrategy } from './app.logger';
import { ConsoleLogStrategy } from './log.strategy';
import { OtlpLogStrategy } from './otlp.log.strategy';

export class LoggerBuilder {
  private static instance: CustomLogger | null = null;
  private strategies: ILogStrategy[] = [];
  private loggerProvider: LoggerProvider;
  private instrumentationScope: { name: string; version: string };
  private formatType: 'json' | 'human' = 'json';
  private colorsEnabled: boolean = false;

  constructor(name: string = 'syrax-lib', version: string = '1.0.0') {
    this.instrumentationScope = { name, version };
    this.loggerProvider = new LoggerProvider();
  }

  public addConsoleStrategy(): LoggerBuilder {
    this.strategies.push(new ConsoleLogStrategy(this.formatType, this.colorsEnabled));
    return this;
  }

  public addOtlpStrategy(): LoggerBuilder {
    this.strategies.push(new OtlpLogStrategy(this.loggerProvider, this.instrumentationScope.name, this.instrumentationScope.version));
    return this;
  }

  public setFormat(formatType: 'json' | 'human'): LoggerBuilder {
    this.formatType = formatType;
    return this;
  }

  public enableColors(): LoggerBuilder {
    this.colorsEnabled = true;
    return this;
  }

  public build(): CustomLogger {
    return new CustomLogger(new LogManager(this.strategies));
  }

  public static getLoggerInstance(): CustomLogger {
    if (!LoggerBuilder.instance) {
      throw new Error('Logger instance is not initialized. Call build() first.');
    }
    return LoggerBuilder.instance;
  }
}

export class LogManager implements ILogStrategy {
  private strategies: ILogStrategy[];

  constructor(strategies: ILogStrategy[]) {
      this.strategies = strategies;
  }

  public log(level: string, message: string, logAttributes: Record<string, any>): void {
      this.strategies.forEach(strategy => strategy.log(level, message, logAttributes));
  }
}

