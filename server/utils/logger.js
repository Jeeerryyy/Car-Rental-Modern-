/**
 * server/utils/logger.js
 * Winston Structured Logging Configuration
 * 
 * This module replaces standard console.log with structured JSON logging.
 * Structured logs are vastly easier to parse in centralized log management systems
 * like Datadog, ELK stack, or AWS CloudWatch.
 */

const winston = require('winston');
const { format } = winston;
const api = require('@opentelemetry/api');

// Extract the trace ID from the active OpenTelemetry context
// so that logs can be correlated with the specific request trace in Jaeger/Datadog.
const traceFormat = format((info) => {
  const span = api.trace.getSpan(api.context.active());
  if (span) {
    const { traceId, spanId } = span.spanContext();
    info.trace_id = traceId;
    info.span_id = spanId;
  }
  return info;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info', // Adjust log verbosity via env
  format: format.combine(
    traceFormat(),
    format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    format.errors({ stack: true }),
    // Use pure JSON formatting for machine readability in production
    format.json()
  ),
  defaultMeta: { service: 'modern-selfdrive-backend' },
  transports: [
    // Output all logs to standard output (handled by PM2)
    new winston.transports.Console()
  ]
});

// If we're not in production, append a readable console format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

module.exports = logger;
