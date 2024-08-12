import { Attributes } from '@opentelemetry/api';
import { CounterMetric } from './../metrics/counter.metric';
import { GaugeMetric } from './../metrics/gauge.metric';
import { HistogramMetric } from './../metrics/histogram.metric';
import { MetricsManager } from '../metrics/metrics.manager';
import {
  CounterMetricStrategy,
  GaugeMetricStrategy,
  HistogramMetricStrategy,
  MetricStrategy,
} from './metric.strategy';
import { CpuMetric } from '../metrics/cpu.metric';
import { MemoryMetric } from '../metrics/memory.metric';

export class MetricsBuilder {
  private strategies: Map<string, MetricStrategy> = new Map();
  private baseAttributes: Attributes = {};
  private meterName: string;
  private version: string;

  /**
   * Constructor to initialize meterName and version.
   * @param meterName - The name of the meter (common across all metrics).
   * @param version - The version of the meter (common across all metrics).
   */
  constructor(meterName: string, version: string) {
    this.meterName = meterName;
    this.version = version;
  }

  /**
   * Adds a counter metric to the builder.
   * @param counterName - The name of the counter metric.
   * @param description - Optional description for the metric.
   * @returns MetricsBuilder - The current instance of MetricsBuilder.
   */
  public addCounter(counterName: string, description?: string): MetricsBuilder {
    if (!this.meterName || !this.version) {
      throw new Error('Meter name and version must be configured before adding metrics.');
    }
    const counter = new CounterMetric(this.meterName, this.version, counterName, description);
    this.strategies.set(counterName, new CounterMetricStrategy(counter));
    return this;
  }

  /**
   * Adds a histogram metric to the builder.
   * @param histogramName - The name of the histogram metric.
   * @param description - Optional description for the metric.
   * @returns MetricsBuilder - The current instance of MetricsBuilder.
   */
  public addHistogram(histogramName: string, description?: string): MetricsBuilder {
    if (!this.meterName || !this.version) {
      throw new Error('Meter name and version must be configured before adding metrics.');
    }
    const histogram = new HistogramMetric(this.meterName, this.version, histogramName, description);
    this.strategies.set(histogramName, new HistogramMetricStrategy(histogram));
    return this;
  }

  /**
   * Adds a gauge metric to the builder.
   * @param gaugeName - The name of the gauge metric.
   * @param description - Optional description for the metric.
   * @returns MetricsBuilder - The current instance of MetricsBuilder.
   */
  public addGauge(gaugeName: string, description?: string): MetricsBuilder {
    if (!this.meterName || !this.version) {
      throw new Error('Meter name and version must be configured before adding metrics.');
    }
    const gauge = new GaugeMetric(this.meterName, this.version, gaugeName, description);
    this.strategies.set(gaugeName, new GaugeMetricStrategy(gauge));
    return this;
  }

  /**
   * Adds a memory gauge metric to the builder.
   * @param memoryName - The name of the memory gauge metric.
   * @param description - Optional description for the metric.
   * @returns MetricsBuilder - The current instance of MetricsBuilder.
   */
  public addGaugeCpu(cpuName: string, description?: string): MetricsBuilder {
    if (!this.meterName || !this.version) {
      throw new Error('Meter name and version must be configured before adding metrics.');
    }
    const gauge = new CpuMetric(this.meterName, this.version, cpuName, description);
    this.strategies.set(cpuName, new GaugeMetricStrategy(gauge));
    return this;
  }

  /**
   * Adds a memory gauge metric to the builder.
   * @param memoryName - The name of the memory gauge metric.
   * @param description - Optional description for the metric.
   * @returns MetricsBuilder - The current instance of MetricsBuilder.
   */
  public addGaugeMemory(memoryName: string, description?: string): MetricsBuilder {
    if (!this.meterName || !this.version) {
      throw new Error('Meter name and version must be configured before adding metrics.');
    }
    const gauge = new MemoryMetric(this.meterName, this.version, memoryName, description);
    this.strategies.set(memoryName, new GaugeMetricStrategy(gauge));
    return this;
  }

  /**
   * Sets base attributes that apply to all metrics.
   * @param attributes - The base attributes.
   * @returns MetricsBuilder - The current instance of MetricsBuilder.
   */
  public setBaseAttributes(attributes: Partial<Attributes>): MetricsBuilder {
    this.baseAttributes = attributes;
    return this;
  }

  /**
   * Builds and returns an instance of MetricsManager.
   * @returns MetricsManager - The configured MetricsManager instance.
   */
  public build(): MetricsManager {
    return MetricsManager.getInstance(this.strategies, this.baseAttributes);
  }
}
