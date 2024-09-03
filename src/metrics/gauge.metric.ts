import { Attributes, ObservableGauge, ObservableResult } from '@opentelemetry/api';
import { BaseMetric } from '../core/base.metric';
import { Components } from '../utils/enums';
import { CustomLogger } from '../logger/app.logger';

/**
 * Class for gauge metrics.
 * Provides methods to create and observe gauge metrics.
 */
export class GaugeMetric extends BaseMetric {
  private gauge: ObservableGauge;
  private logger: CustomLogger;
  private gaugeName: string;

  /**
   * Initializes the GaugeMetric class with the specified meter name, version, and gauge name.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   * @param gaugeName - The name of the gauge metric.
   * @param description - The description of the gauge metric.
   */
  constructor(meterName: string, version: string, gaugeName: string, logger: CustomLogger, description: string) {
    super(meterName, version);
    this.logger = logger;
    this.gaugeName = gaugeName;
    
    this.gauge = this.getMeter().createObservableGauge(gaugeName, {
      description,
    });

    this.gauge.addCallback(this.observe.bind(this));
  }

  /**
   * Sets the gauge value with labels.
   * @param labels - Labels for the metric.
   * @param value - The value to set.
   */
  private observe(observableResult: ObservableResult): void {
    const attributes = this.getCurrentAttributes();
    const value = this.computeCurrentValue();
    observableResult.observe(value, attributes);
    this.logger.withFields({ value, attributes, meterName: this.gaugeName }).info('Gauge value observed');
  }

  /**
   * Sets the gauge value with labels.
   * @param labels - Labels for the metric.
   * @param value - The value to set.
   */
  public computeCurrentValue(): number {
    return Math.random() * 100;
  }

  /**
   * Return the attributes specific to the gauge metric.
   */
  public getCurrentAttributes(): Attributes {
    return { component: Components.SYSTEM }; 
  }
}
