import { Attributes, Counter } from '@opentelemetry/api';
import { BaseMetric } from '../core/base.metric';
import { CustomLogger } from '../logger/app.logger';

/**
 * Class for counter metrics.
 * Provides methods to create and increment counters.
 */
export class CounterMetric extends BaseMetric {
  private counter: Counter;
  private logger: CustomLogger;
  private counterName: string;
  
  /**
   * Initializes the CounterMetric class with the specified meter name, version, and counter name.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   * @param counterName - The name of the counter metric.
   * @param description - The description of the counter metric.
   */
  constructor(meterName: string, version: string, counterName: string, logger: CustomLogger, description: string) {
    super(meterName, version);
    this.logger = logger;
    this.counterName = counterName;
    this.counter = this.getMeter().createCounter(counterName, { description});
  }

  /**
   * Increments the counter by a specified value with labels.
   * @param labels - Labels for the metric.
   * @param value - The increment value, default is 1.
   */
  public  increment(labels: Attributes, value: number = 1): void {
    this.counter.add(value, labels);
    this.logger.withFields({ value, labels, meterName: this.counterName }).info('Counter incremented');
  }

  /**
   * Returns the counter instance.
   */
  public getCounter(): Counter {
    return this.counter;
  }
}
