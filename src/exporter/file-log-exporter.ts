import { LogRecord } from '@opentelemetry/api-logs';
import { LogRecordExporter } from '@opentelemetry/sdk-logs';
import { CommonLogFolder } from '../utils/enums';
import * as fs from 'fs';

/**
 * FileLogExporter is an implementation of the {@link LogRecordExporter} that writes log records to a file.
 */
export class FileLogExporter implements LogRecordExporter {
  public logStream: fs.WriteStream;

  constructor(filePath: string = CommonLogFolder) {
    this.logStream = fs.createWriteStream(filePath, { flags: 'a' });
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
