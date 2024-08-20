import { LogRecord } from '@opentelemetry/api-logs';
import { LogRecordExporter } from '@opentelemetry/sdk-logs';
import * as fs from 'fs';

export class FileLogExporter implements LogRecordExporter {
  private logStream: fs.WriteStream;

  constructor() {
    this.logStream = fs.createWriteStream('/var/log/otel_logs.log', { flags: 'a' });
  }

  export(logRecords: LogRecord[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        for (const record of logRecords) {
          this.logStream.write(JSON.stringify(record) + '\n');
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.logStream.end((err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
