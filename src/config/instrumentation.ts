import * as opentelemetry from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';


export interface SDKConfig {
  serviceName: string;
  serviceVersion?: string;
}

export function createResource(config: SDKConfig): Resource {
  return new Resource({
    [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
    [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion || 'unknown',
  });
}

export function createSDK(config: SDKConfig): opentelemetry.NodeSDK {
  const resource = createResource(config);

  return new opentelemetry.NodeSDK({
    resource,
    traceExporter: new OTLPTraceExporter({
      headers: {},
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        headers: {},
      }),
    }),
    logRecordProcessor: new BatchLogRecordProcessor(
      new OTLPLogExporter({
        headers: {},
      })
    ),
    instrumentations: [getNodeAutoInstrumentations()],
  });
}
