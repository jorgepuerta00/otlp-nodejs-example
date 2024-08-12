export interface ILogStrategy {
  log(level: string, message: string, logAttributes: Record<string, any>): void;
}

export class CustomLogger {
  private logStrategy: ILogStrategy;
  private customFields: Record<string, any> = {};

  constructor(logStrategy: ILogStrategy) {
    this.logStrategy = logStrategy;
  }

  public withFields(fields: Record<string, any>): this {
    this.customFields = fields;
    return this;
  }

  public trace(message: string): void {
    this.log('trace', message);
  }

  public debug(message: string): void {
    this.log('debug', message);
  }

  public info(message: string): void {
    this.log('info', message);
  }

  public warn(message: string): void {
    this.log('warn', message);
  }

  public error(message: string): void {
    this.log('error', message);
  }

  public fatal(message: string): void {
    this.log('fatal', message);
  }

  private log(level: string, message: string): void {
    const logAttributes = { ...this.customFields };
    this.logStrategy.log(level, message, logAttributes);
    this.clearCustomFields();
  }

  private clearCustomFields(): void {
    this.customFields = {};
  }
}
