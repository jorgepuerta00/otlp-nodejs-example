import { LoggerProvider, LogRecord } from '@opentelemetry/sdk-logs';
import { LogAttributes, SeverityNumber, LogBody } from '@opentelemetry/api-logs';
import { Context, context as apiContext } from '@opentelemetry/api';
import { ILogStrategy } from './app.logger';
import { InstrumentationScope } from '@opentelemetry/core';

export class OtlpLogStrategy implements ILogStrategy {
  private loggerProvider: LoggerProvider;
  private instrumentationScope: InstrumentationScope;

  constructor(loggerProvider: LoggerProvider, name: string, version: string) {
    this.loggerProvider = loggerProvider;
    this.instrumentationScope = { name, version };
  }

  log(level: string, message: string, logAttributes: LogAttributes): void {
    const sharedState = (this.loggerProvider as any)._sharedState;
    
    const logRecord = new LogRecord(
      sharedState,
      this.instrumentationScope,
      {
        body: message as LogBody,
        severityText: level.toUpperCase(),
        severityNumber: this.mapSeverityNumber(level),
        attributes: logAttributes,
        timestamp: Date.now(),
        observedTimestamp: Date.now(),
        context: apiContext.active(),
      }
    );

    const logger = this.loggerProvider.getLogger(
      this.instrumentationScope.name,
      this.instrumentationScope.version
    );
    logger.emit(logRecord);
  }

  private mapSeverityNumber(level: string): SeverityNumber {
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
}
