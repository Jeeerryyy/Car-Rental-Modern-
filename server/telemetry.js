/**
 * server/telemetry.js
 * OpenTelemetry Configuration for Node.js
 * 
 * This file initializes the OpenTelemetry SDK before the application starts.
 * It instruments all incoming HTTP requests, Mongoose queries, and Express routes,
 * injecting a unique trace ID into each transaction to track full lifecycle latency.
 * Traces are exported to a Jaeger instance (configurable via OTLP).
 */

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');

// The exporter is configured to send data to a standard Jaeger OTLP receiver.
// This URL can be swapped via environment variables to target Datadog or New Relic.
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTLP_EXPORTER_URL || 'http://localhost:4318/v1/traces',
  // Optional headers can be supplied here for APM authentication (e.g. New Relic License Key)
  headers: {}
});

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'modern-selfdrive-backend',
    [ATTR_SERVICE_VERSION]: '1.0.0',
    'deployment.environment': process.env.NODE_ENV || 'development'
  }),
  traceExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // We disable fs instrumentation to prevent trace flooding from simple disk reads
      '@opentelemetry/instrumentation-fs': { enabled: false },
      // Specifically instrument express to capture route latencies
      '@opentelemetry/instrumentation-express': { enabled: true },
      // Specifically instrument HTTP to capture external calls to Cloudinary/Redis
      '@opentelemetry/instrumentation-http': { enabled: true },
      // Instrument mongoose to capture slow MongoDB queries
      '@opentelemetry/instrumentation-mongoose': { enabled: true }
    })
  ]
});

// Start the SDK
sdk.start();

// Graceful shutdown to flush traces before the process exits
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});

module.exports = sdk;
