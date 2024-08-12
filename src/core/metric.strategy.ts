/* eslint-disable @typescript-eslint/no-unused-vars */
import { Attributes } from '@opentelemetry/api';
import { CounterMetric } from './../metrics/counter.metric';
import { GaugeMetric } from './../metrics/gauge.metric';
import { HistogramMetric } from './../metrics/histogram.metric';
import { CpuMetric } from '../metrics/cpu.metric';
import { MemoryMetric } from '../metrics/memory.metric';
import { BaseMetric } from './base.metric';
import { CustomLogger } from '../logger/app.logger';

export interface MetricStrategy {
  increment(labels: Attributes, value?: number): void;
  record(labels: Attributes, value: number): void;
  getMetric(): BaseMetric;
}

export class CounterMetricStrategy implements MetricStrategy {
  private counter: CounterMetric;

  constructor(counter: CounterMetric) {
    this.counter = counter;
  }

  increment(labels: Attributes, value: number = 1): void {
    this.counter.increment(labels, value);
  }

  record(labels: Attributes, value: number): void {
    throw new Error('Increment not supported for CounterMetric');
  }

  getMetric() {
    return this.counter;
  }
}

export class HistogramMetricStrategy implements MetricStrategy {
  private histogram: HistogramMetric;

  constructor(histogram: HistogramMetric) {
    this.histogram = histogram;
  }

  increment(labels: Attributes, value: number = 1): void {
    throw new Error('Increment not supported for HistogramMetric');
  }

  record(labels: Attributes, value: number): void {
    this.histogram.record(labels, value);
  }

  getMetric() {
    return this.histogram;
  }
}

export class GaugeMetricStrategy implements MetricStrategy {
  private gaugeMetric: GaugeMetric;

  constructor(gaugeMetric: GaugeMetric) {
    this.gaugeMetric = gaugeMetric;
  }

  increment(labels: Attributes, value: number = 1): void {
    throw new Error('Increment not supported for GaugeMetric');
  }

  record(labels: Attributes, value: number): void {
    throw new Error('Record not supported for GaugeMetric');
  }

  getMetric() {
    return this.gaugeMetric;
  }

  public setCallback(callback: () => { value: number; labels: Attributes }): void {
    this.gaugeMetric['observe'] = (observableResult) => {
      const { value, labels } = callback();
      observableResult.observe(value, labels);
    };
  }
}

export class CpuMetricStrategy extends GaugeMetricStrategy {
  constructor(meterName: string, version: string, gaugeName: string, logger: CustomLogger, description: string) {
    super(new CpuMetric(meterName, version, gaugeName, logger, description));
  }
}

export class MemoryMetricStrategy extends GaugeMetricStrategy {
  constructor(meterName: string, version: string, gaugeName: string, logger: CustomLogger, description: string) {
    super(new MemoryMetric(meterName, version, gaugeName, logger, description));
  }
}
