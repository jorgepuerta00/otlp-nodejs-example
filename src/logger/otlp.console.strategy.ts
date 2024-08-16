import { logs, Logger, LogRecord } from '@opentelemetry/api-logs';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { ConsoleLogRecordExporter } from '@opentelemetry/sdk-logs';
import { LogAttributes, SeverityNumber } from '@opentelemetry/api-logs';
import { ILogStrategy } from './app.logger';

export class OtelConsoleLogStrategy implements ILogStrategy {
  private loggerProvider: LoggerProvider;
  private logger: Logger;

  constructor() {
    this.loggerProvider = new LoggerProvider();
    
    this.loggerProvider.addLogRecordProcessor(
      new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
    );

    this.logger = logs.getLogger('default');
  }

  public log(level: string, message: string, logAttributes: LogAttributes): void {
    const logRecord: LogRecord = {
      severityNumber: mapSeverityNumber(level),
      severityText: level.toUpperCase(),
      body: message,
      attributes: logAttributes,
    };
    
    this.logger.emit(logRecord);
  }
}

export function mapSeverityNumber(level: string): SeverityNumber {
  switch (level.toLowerCase()) {
    case 'trace':
      return SeverityNumber.TRACE;
    case 'debug':
      return SeverityNumber.DEBUG;
    case 'info':
      return SeverityNumber.INFO;
    case 'warn':
      return SeverityNumber.WARN;
    case 'error':
      return SeverityNumber.ERROR;
    case 'fatal':
      return SeverityNumber.FATAL;
    default:
      return SeverityNumber.UNSPECIFIED;
  }
}