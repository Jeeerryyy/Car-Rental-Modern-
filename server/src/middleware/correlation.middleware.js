import { AsyncLocalStorage } from 'async_hooks';
import crypto from 'crypto';

export const traceStorage = new AsyncLocalStorage();

// Simple UUID generator fallback if uuid module is not fully loaded/imported
const generateUUID = () => {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
};

export const correlationMiddleware = (req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || req.headers['correlation-id'] || generateUUID();
  
  // W3C Trace Context support
  // Format: 00-traceid-parentid-flags
  let traceparent = req.headers['traceparent'];
  let traceId;
  let parentId;
  let traceFlags = '01';

  if (traceparent && /^00-[a-f0-9]{32}-[a-f0-9]{16}-[a-f0-9]{2}$/i.test(traceparent)) {
    const parts = traceparent.split('-');
    traceId = parts[1];
    parentId = parts[2];
    traceFlags = parts[3];
  } else {
    traceId = crypto.randomBytes(16).toString('hex');
    parentId = crypto.randomBytes(8).toString('hex');
    traceparent = `00-${traceId}-${parentId}-${traceFlags}`;
  }

  const tracestate = req.headers['tracestate'] || '';

  const context = {
    correlationId,
    traceId,
    parentId,
    traceparent,
    tracestate,
    startTime: Date.now()
  };

  // Set response headers for downstream visibility/continuity
  res.setHeader('x-correlation-id', correlationId);
  res.setHeader('traceparent', traceparent);
  if (tracestate) {
    res.setHeader('tracestate', tracestate);
  }

  traceStorage.run(context, () => {
    req.correlationId = correlationId;
    req.traceContext = context;
    next();
  });
};

export const getTraceContext = () => {
  return traceStorage.getStore() || null;
};
