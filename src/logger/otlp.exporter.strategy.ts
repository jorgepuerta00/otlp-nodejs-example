import { logs, Logger } from '@opentelemetry/api-logs';
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { LogAttributes, LogRecord } from '@opentelemetry/api-logs';
import { ILogStrategy } from './app.logger';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { mapSeverityNumber } from './otlp.console.strategy';

export class OtlpLogExporterStrategy implements ILogStrategy {
  private loggerProvider: LoggerProvider;
  private logger: Logger;  

  constructor(name: string, url: string) {
    this.loggerProvider = new LoggerProvider();

    this.loggerProvider.addLogRecordProcessor(
      new SimpleLogRecordProcessor(new OTLPLogExporter({ url }))
    );

    logs.setGlobalLoggerProvider(this.loggerProvider);
    this.logger = logs.getLogger(name);
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
