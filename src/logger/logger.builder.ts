import { CustomLogger, ILogStrategy } from './app.logger';
import { WistonLogOptions, WistonConsoleLogStrategy } from './wiston.console.strategy';
import { OtlpLogExporterStrategy } from './otlp.exporter.strategy';
import { OtelConsoleLogStrategy } from './otlp.console.strategy';

export class LoggerBuilder {
  private static instance: CustomLogger | null = null;
  private strategies: ILogStrategy[] = [];
  private instrumentationScope: { name: string; version: string };

  constructor(name: string, version: string) {
    this.instrumentationScope = { name, version };
  }

  public addWistonConsoleLog(options: WistonLogOptions = {}): LoggerBuilder {
    this.strategies.push(new WistonConsoleLogStrategy(this.instrumentationScope.name, options));
    return this;
  }

  public addOTLPLogExporter(): LoggerBuilder {
    this.strategies.push(new OtlpLogExporterStrategy(this.instrumentationScope.name, this.instrumentationScope.version));
    return this;
  }

  public addOTLPConsoleLog(): LoggerBuilder {
    this.strategies.push(new OtelConsoleLogStrategy());
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log(level: string, message: string, logAttributes: Record<string, any>): void {
      this.strategies.forEach(strategy => strategy.log(level, message, logAttributes));
  }
}

