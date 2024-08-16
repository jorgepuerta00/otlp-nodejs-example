import * as opentelemetry from '@opentelemetry/sdk-node';
import { DiagConsoleLogger, DiagLogLevel, diag } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs';
import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';

export interface SDKConfig {
  serviceName: string;
  serviceVersion: string;
  url: string;
}

export function createResource(config: SDKConfig) {
  return Resource.default().merge(
    new Resource({
      [SEMRESATTRS_SERVICE_NAME]: config.serviceName,
      [SEMRESATTRS_SERVICE_VERSION]: config.serviceVersion,
    })
  );
}

export function createOpenTelemetrySDK(config: SDKConfig): opentelemetry.NodeSDK {

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
  
  return new opentelemetry.NodeSDK({
    resource: createResource(config),
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter(),
    }),
    logRecordProcessor: new SimpleLogRecordProcessor(new OTLPLogExporter({
      url: config.url,
      keepAlive: true,
    })),
    instrumentations: [getNodeAutoInstrumentations()],
  });
}
