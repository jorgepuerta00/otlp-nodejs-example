import { Counter } from '@opentelemetry/api';
import { BaseMetric } from './base.metric';
import { AppLogger } from '../logger/app.logger';

/**
 * Class for counter metrics.
 * Provides methods to create and increment counters.
 */
export class CounterMetric extends BaseMetric {
  private counter: Counter;
  private logger: AppLogger;
  
  /**
   * Initializes the CounterMetric class with the specified meter name, version, and counter name.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   * @param counterName - The name of the counter metric.
   */
  constructor(meterName: string, version: string, counterName: string) {
    super(meterName, version);
    this.logger = new AppLogger();
    this.counter = this.getMeter().createCounter(counterName);
  }

  /**
   * Increments the counter by a specified value with labels.
   * @param labels - Labels for the metric.
   * @param value - The increment value, default is 1.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public  increment(labels: { [key: string]: any }, value: number = 1): void {
    this.counter.add(value, labels);
    this.logger.withFields({ value, labels }).info('Counter incremented');
  }

  /**
   * Returns the counter instance.
   */
  public getCounter(): Counter {
    return this.counter;
  }
}
