import { GaugeMetric } from './gauge.metric';
import { Attributes } from '@opentelemetry/api';
import { Components } from '../utils/enums';
import { CustomLogger } from '../logger/app.logger';

/**
 * Class representing a metric for active sessions.
 * Extends the generic GaugeMetric class to provide specific logic for active sessions.
 */
export class ActiveSessionsMetric extends GaugeMetric {
  private activeSessions: number = 0;

  constructor(meterName: string, version: string, gaugeName: string, logger: CustomLogger, description: string) {
    super(meterName, version, gaugeName, logger, description);
  }

  /**
   * The callback to observe the current number of active sessions.
   */
  public computeCurrentValue(): number {
    return this.activeSessions;
  }

  /**
   * Return the attributes specific to the active sessions metric.
   */
  public getCurrentAttributes(): Attributes {
    return { component: Components.SYSTEM, metric_type: Components.SESSION };
  }

  /**
   * Increment the number of active sessions.
   */
  public sessionStarted(): void {
    this.activeSessions++;
  }

  /**
   * Decrement the number of active sessions.
   */
  public sessionEnded(): void {
    this.activeSessions--;
  }
}
