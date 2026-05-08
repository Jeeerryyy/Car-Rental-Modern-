const logger = require('./logger');

let requestCount = 0;
let errorCount = 0;
const responseTimes = [];
const statusCodes = {};

const metrics = {
  requests: {
    total: 0,
    byMethod: {},
    byEndpoint: {},
    byStatus: {}
  },
  responses: {
    total: 0,
    avgTime: 0,
    byTimeRange: { '<100ms': 0, '100-300ms': 0, '300-1000ms': 0, '>1s': 0 }
  },
  errors: {
    total: 0,
    byType: {}
  },
  business: {
    bookings: { created: 0, cancelled: 0, completed: 0 },
    users: { registered: 0, logins: 0 },
    payments: { total: 0, amount: 0 }
  }
};

const recordRequest = (method, endpoint) => {
  metrics.requests.total++;
  metrics.requests.byMethod[method] = (metrics.requests.byMethod[method] || 0) + 1;
  
  const baseEndpoint = endpoint.split('?')[0];
  metrics.requests.byEndpoint[baseEndpoint] = (metrics.requests.byEndpoint[baseEndpoint] || 0) + 1;
};

const recordResponse = (statusCode, duration) => {
  metrics.responses.total++;
  
  if (statusCode >= 400) {
    metrics.errors.total++;
  }

  const statusCategory = `${Math.floor(statusCode / 100)}xx`;
  metrics.requests.byStatus[statusCategory] = (metrics.requests.byStatus[statusCategory] || 0) + 1;
  
  if (duration < 100) metrics.responses.byTimeRange['<100ms']++;
  else if (duration < 300) metrics.responses.byTimeRange['100-300ms']++;
  else if (duration < 1000) metrics.responses.byTimeRange['300-1000ms']++;
  else metrics.responses.byTimeRange['>1s']++;
};

const recordBusiness = (type, data) => {
  if (metrics.business[type]) {
    if (metrics.business[type][data.action]) {
      metrics.business[type][data.action]++;
    }
  }
};

const getMetrics = () => ({
  requests: { ...metrics.requests },
  responses: { ...metrics.responses, avgTime: metrics.responses.avgTime },
  errors: { ...metrics.errors },
  business: { ...metrics.business },
  uptime: process.uptime(),
  memory: process.memoryUsage(),
  timestamp: new Date().toISOString()
});

const formatPrometheus = () => {
  const m = getMetrics();
  let output = '';
  
  output += `# HELP http_requests_total Total HTTP requests\n`;
  output += `# TYPE http_requests_total counter\n`;
  output += `http_requests_total ${m.requests.total}\n`;
  
  output += `# HELP http_response_time_avg Average response time in ms\n`;
  output += `# TYPE http_response_time_avg gauge\n`;
  output += `http_response_time_avg ${m.responses.avgTime}\n`;
  
  output += `# HELP http_errors_total Total HTTP errors\n`;
  output += `# TYPE http_errors_total counter\n`;
  output += `http_errors_total ${m.errors.total}\n`;
  
  output += `# HELP business_bookings_total Total business bookings\n`;
  output += `# TYPE business_bookings_total counter\n`;
  output += `business_bookings_total ${m.business.bookings.created}\n`;
  
  output += `# HELP business_payments_total Total payment amount\n`;
  output += `# TYPE business_payments_total counter\n`;
  output += `business_payments_total ${m.business.payments.amount}\n`;
  
  output += `# HELP process_uptime_seconds Process uptime\n`;
  output += `# TYPE process_uptime_seconds gauge\n`;
  output += `process_uptime_seconds ${m.uptime}\n`;
  
  output += `# HELP process_memory_bytes Process memory\n`;
  output += `# TYPE process_memory_bytes gauge\n`;
  output += `process_memory_bytes ${m.memory.heapUsed}\n`;
  
  return output;
};

const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.once('finish', () => {
    const duration = Date.now() - start;
    recordRequest(req.method, req.originalUrl);
    recordResponse(res.statusCode, duration);
  });
  
  next();
};

module.exports = {
  metrics,
  recordRequest,
  recordResponse,
  recordBusiness,
  getMetrics,
  formatPrometheus,
  metricsMiddleware
};