import promClient from 'prom-client';
import promBundle from 'express-prom-bundle';

// Create a custom registry
const register = new promClient.Registry();

// Enable default metrics (CPU, memory, event loop lag, etc.)
promClient.collectDefaultMetrics({ register });

// Define custom metrics
export const authFailuresCounter = new promClient.Counter({
  name: 'auth_failures_total',
  help: 'Total number of failed authentication attempts',
  labelNames: ['reason']
});
register.registerMetric(authFailuresCounter);

export const paymentFailuresCounter = new promClient.Counter({
  name: 'payment_failures_total',
  help: 'Total number of payment failures',
  labelNames: ['gateway', 'reason']
});
register.registerMetric(paymentFailuresCounter);

export const uploadFailuresCounter = new promClient.Counter({
  name: 'upload_failures_total',
  help: 'Total number of file upload failures',
  labelNames: ['reason']
});
register.registerMetric(uploadFailuresCounter);

export const dbSlowQueriesCounter = new promClient.Counter({
  name: 'db_slow_queries_total',
  help: 'Total number of database queries exceeding the SLA threshold',
  labelNames: ['operation', 'collection']
});
register.registerMetric(dbSlowQueriesCounter);

export const queueFailuresCounter = new promClient.Counter({
  name: 'queue_failures_total',
  help: 'Total number of background queue job failures',
  labelNames: ['queue', 'job']
});
register.registerMetric(queueFailuresCounter);

// Express Prometheus middleware configuration
export const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  promRegistry: register,
  customLabels: { app: 'modern-drive' },
  autoregister: false // We will manually handle registry integration to secure the /metrics endpoint
});

export const getMetricsString = async () => {
  return await register.metrics();
};

export default {
  metricsMiddleware,
  getMetricsString,
  authFailuresCounter,
  paymentFailuresCounter,
  uploadFailuresCounter,
  dbSlowQueriesCounter,
  queueFailuresCounter
};
