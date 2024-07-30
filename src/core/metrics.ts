import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('dice-server', '0.1.0');
const responseCounter = meter.createCounter('http_response_count');
const requestCounter = meter.createCounter('http_request_count');

let baseAttributes = { app: 'defaultApp', environment: 'development' };

export const setBaseAttributes = (attributes: { app: string; environment: string }) => {
  baseAttributes = attributes;
};

export const incrementRequestCounter = (labels: { path: string, method: string, [key: string]: any }) => {
  const attributes = { ...baseAttributes, ...labels };
  requestCounter.add(1, attributes);
  console.log('increment request counter', attributes);
};

export const incrementResponseCounter = (labels: { path: string, method: string, statuscode: number, [key: string]: any }) => {
  const attributes = { ...baseAttributes, ...labels };
  responseCounter.add(1, attributes);
  console.log('increment response counter', attributes);
};
