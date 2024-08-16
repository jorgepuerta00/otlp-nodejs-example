import { logs, Logger } from '@opentelemetry/api-logs';
import { LogAttributes, LogRecord } from '@opentelemetry/api-logs';
import { ILogStrategy } from './app.logger';
import { mapSeverityNumber } from './otlp.console.strategy';

export class OtlpLogExporterStrategy implements ILogStrategy {
  private logger: Logger;  

  constructor(name: string, version: string) {
    this.logger = logs.getLogger(name, version);
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
