import { logs, Logger } from '@opentelemetry/api-logs';
import { LogAttributes, LogRecord } from '@opentelemetry/api-logs';
import { ILogStrategy } from './app.logger';
import { mapSeverityNumber } from './otlp.console.strategy';

/**
 * OtlpLogExporterStrategy is an implementation of the {@link ILogStrategy} that writes log records to loki.
 * This class uses the OpenTelemetry SDK to create a logger that writes log records to the loki.
 */
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
