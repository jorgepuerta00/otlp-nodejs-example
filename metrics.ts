import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('dice-server', '0.1.0');
const responseCounter = meter.createCounter('http_response_count');
const requestCounter = meter.createCounter('http_request_count');

let baseAttributes = { app: 'defaultApp', environment: 'development' };

export const setBaseAttributes = (attributes: { app: string; environment: string }) => {
  baseAttributes = attributes;
};

export const incrementRequestCounter = (path: string, httpMethod: string) => {
  const attributes = { ...baseAttributes, path, http: httpMethod };
  requestCounter.add(1, attributes);
};

export const incrementResponseCounter = (path: string, httpMethod: string, status: number) => {
  const attributes = { ...baseAttributes, path, http: httpMethod, statuscode: status };
  responseCounter.add(1, attributes);
};
