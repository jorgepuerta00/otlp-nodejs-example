/* eslint-disable @typescript-eslint/no-unused-vars */
import { Attributes } from '@opentelemetry/api';
import { CounterMetric } from './../metrics/counter.metric';
import { GaugeMetric } from './../metrics/gauge.metric';
import { HistogramMetric } from './../metrics/histogram.metric';

export interface MetricStrategy {
  increment(labels: Attributes, value?: number): void;
  record(labels: Attributes, value: number): void;
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
    throw new Error('Method not implemented.');
  }
}

export class HistogramMetricStrategy implements MetricStrategy {
  private histogram: HistogramMetric;

  constructor(histogram: HistogramMetric) {
    this.histogram = histogram;
  }

  increment(labels: Attributes, value: number = 1): void {
    throw new Error('Method not implemented.');
  }

  record(labels: Attributes, value: number): void {
    this.histogram.record(labels, value);
  }
}

export class GaugeMetricStrategy implements MetricStrategy {
  private gauge: GaugeMetric;

  constructor(gauge: GaugeMetric) {
    this.gauge = gauge;
  }

  increment(labels: Attributes, value: number = 1): void {
    throw new Error('Method not implemented.');
  }

  record(labels: Attributes, value: number): void {
    this.gauge.set(labels, value);
  }
}