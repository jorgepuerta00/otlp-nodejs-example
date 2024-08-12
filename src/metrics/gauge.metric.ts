import { Attributes, ObservableGauge, ObservableResult } from '@opentelemetry/api';
import { BaseMetric } from '../core/base.metric';
import { AppLogger } from '../logger/app.logger';

/**
 * Class for gauge metrics.
 * Provides methods to create and update gauges.
 */
export class GaugeMetric extends BaseMetric {
  private gauge: ObservableGauge;
  private logger: AppLogger;
  private gaugeName: string;
  private currentValue: number;
  private currentAttributes: Attributes;

  /**
   * Initializes the GaugeMetric class with the specified meter name, version, and gauge name.
   * @param meterName - The name of the meter used for creating metrics.
   * @param version - The version of the meter.
   * @param gaugeName - The name of the gauge metric.
   * @param description - The description of the gauge metric.
   */
  constructor(meterName: string, version: string, gaugeName: string, description?: string) {
    super(meterName, version);
    this.logger = new AppLogger();
    this.gaugeName = gaugeName;
    this.currentValue = 0;
    this.currentAttributes = {};

    this.gauge = this.getMeter().createObservableGauge(gaugeName, { description });
    this.gauge.addCallback(this.observe.bind(this));
  }

  /**
   * Callback method to observe the current value and attributes.
   * @param observableResult - The observable result to observe.
   */
  private observe(observableResult: ObservableResult): void {
    observableResult.observe(this.currentValue, this.currentAttributes);
  }

  /**
   * Sets the value of the gauge with labels.
   * @param labels - Labels for the metric.
   * @param value - The value to set.
   */
  public set(labels: Attributes, value: number): void {
    this.currentValue = value;
    this.currentAttributes = labels;
    this.logger.withFields({ value, labels, gaugeName: this.gaugeName }).info('Gauge value set');
  }

  /**
   * Returns the gauge instance.
   */
  public getGauge(): ObservableGauge {
    return this.gauge;
  }
}
