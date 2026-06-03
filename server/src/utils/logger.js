import winston from 'winston';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTraceContext } from '../middleware/correlation.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../../logs');

if (process.env.NODE_ENV !== 'production' && !existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const sensitiveKeys = ['password', 'token', 'secret', 'authorization', 'signature', 'clientsecret', 'key', 'pass', 'cvv', 'card', 'cookie', 'session', 'razorpay'];

const sanitizeValue = (value, seen = new WeakSet()) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  
  if (seen.has(value)) return '[Circular]';
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map(item => sanitizeValue(item, seen));
  }

  const sanitized = {};
  for (const [k, v] of Object.entries(value)) {
    const lowerKey = k.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      sanitized[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = sanitizeValue(v, seen);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
};

const sanitizeFormat = winston.format((info) => {
  const context = getTraceContext();
  if (context) {
    info.correlationId = context.correlationId;
    info.traceId = context.traceId;
    info.parentId = context.parentId;
  }
  return sanitizeValue(info);
});

const consoleFormat = printf(({ level, message, timestamp, stack, correlationId, traceId }) => {
  const tracePart = traceId ? ` [trace=${traceId}]` : '';
  const correlationPart = correlationId ? ` [corr=${correlationId}]` : '';
  return `${timestamp} [${level}]${tracePart}${correlationPart}: ${stack || message}`;
});

const transports = [
  new winston.transports.Console({
    format: combine(colorize(), consoleFormat)
  })
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: json()
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
      format: json()
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    sanitizeFormat()
  ),
  transports
});

export default logger;
