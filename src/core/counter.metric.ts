import { Counter } from '@opentelemetry/api';
import { BaseMetric } from './base.metric';

/**
 * Class for counter metrics.
 * Provides methods to create and increment counters.
 */
export class CounterMetric extends BaseMetric {
  private counter: Counter;

  /**
   * Initializes the CounterMetric class with the specified meter name, version, and counter name.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   * @param counterName - The name of the counter metric.
   */
  constructor(meterName: string, version: string, counterName: string) {
    super(meterName, version);
    this.counter = this.getMeter().createCounter(counterName);
  }

  /**
   * Increments the counter by a specified value with labels.
   * @param labels - Labels for the metric.
   * @param value - The increment value, default is 1.
   */
  public  increment(labels: { [key: string]: any }, value: number = 1): void {
    this.counter.add(value, labels);
    console.info(`Counter incremented`, { value, labels });
  }

  /**
   * Returns the counter instance.
   */
  public getCounter(): Counter {
    return this.counter;
  }
}
