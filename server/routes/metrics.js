const express = require('express');
const router = express.Router();

const { getMetrics, formatPrometheus, metricsMiddleware } = require('../utils/metrics');
const { getSocketService } = require('../utils/socketService');

router.get('/', (req, res) => {
  const m = getMetrics();
  
  res.json({
    success: true,
    ...m
  });
});

router.get('/prometheus', (req, res) => {
  res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.send(formatPrometheus());
});

router.get('/health', (req, res) => {
  const m = getMetrics();
  const healthy = m.errors.total < m.requests.total * 0.1;
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'unhealthy',
    metrics: {
      requests: m.requests.total,
      errors: m.errors.total,
      errorRate: m.requests.total > 0 ? (m.errors.total / m.requests.total * 100).toFixed(2) + '%' : '0%'
    }
  });
});

router.get('/business', (req, res) => {
  const m = getMetrics();
  res.json({ success: true, business: m.business });
});

module.exports = router;