import { metrics } from '@opentelemetry/api';

/**
 * Base class for creating and managing metrics.
 * Contains common functionalities for metrics like meter initialization.
 */
export abstract class BaseMetric {
  protected meterName: string;
  protected version: string;

  /**
   * Initializes the BaseMetric class with the specified meter name and version.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   */
  constructor(meterName: string, version: string) {
    this.meterName = meterName;
    this.version = version;
  }

  /**
   * Returns the meter instance for creating metrics.
   */
  protected getMeter() {
    return metrics.getMeter(this.meterName, this.version);
  }
}