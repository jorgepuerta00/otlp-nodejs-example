import { CustomLogger, Formatting } from '@apex-org/bbox';

export class AppLogger extends CustomLogger {
  constructor(format: Formatting = 'json') {
    super(format);
  }
}