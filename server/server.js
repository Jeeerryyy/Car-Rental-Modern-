const cluster = require('node:cluster');
const os = require('node:os');

/**
 * In production we fork one worker per CPU core so that the event loop
 * is never the bottleneck. In dev we run a single process to keep
 * debugging simple and HMR fast.
 */
const WORKERS = process.env.WEB_CONCURRENCY || os.cpus().length;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  console.log(`[master] spawning ${WORKERS} workers`);

  for (let i = 0; i < WORKERS; i++) cluster.fork();

  cluster.on('exit', (worker, code) => {
    console.log(`[master] worker ${worker.process.pid} exited (code ${code}), restarting…`);
    cluster.fork();
  });
} else {
  startServer();
}

function startServer() {
  const express    = require('express');
  const mongoose   = require('mongoose');
  const cors       = require('cors');
  const helmet     = require('helmet');
  const morgan     = require('morgan');
  const rateLimit  = require('express-rate-limit');
  const cookieParser = require('cookie-parser');

  require('dotenv').config();

  /* ── env validation ─────────────────────────────────────── */
  const required = ['MONGO_URI', 'JWT_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`[fatal] missing env: ${key}`);
      process.exit(1);
    }
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.error('[fatal] JWT_SECRET too short (min 32 chars)');
    process.exit(1);
  }

  const isProd = process.env.NODE_ENV === 'production';
  const app = express();

  /* ── security ───────────────────────────────────────────── */
  app.use(helmet());
  app.use(morgan(isProd ? 'combined' : 'dev'));

  const origins = [
    process.env.CLIENT_URL,
    process.env.CLIENT_URL_PROD,
    'http://localhost:5173',
    'http://localhost:3000',
  ].filter(Boolean);

  app.use(cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: ${origin} rejected`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  /* ── parsing ────────────────────────────────────────────── */
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  /* ── rate limiting ──────────────────────────────────────── */
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, try again later' },
  }));

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many auth attempts, try again later' },
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  /* ── health ─────────────────────────────────────────────── */
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
  });

  /* ── routes ─────────────────────────────────────────────── */
  app.use('/api/auth',       require('./routes/auth'));
  app.use('/api/cars',       require('./routes/cars'));
  app.use('/api/bookings',   require('./routes/bookings'));
  app.use('/api/admin',      require('./routes/admin'));
  app.use('/api/newsletter', require('./routes/newsletter'));
  app.use('/api/reviews',    require('./routes/reviews'));

  /* ── 404 fallback ───────────────────────────────────────── */
  app.use((_req, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
  });

  /* ── global error handler ───────────────────────────────── */
  app.use((err, _req, res, _next) => {
    console.error('[unhandled]', err.stack || err.message);
    res.status(err.status || 500).json({
      success: false,
      error: isProd ? 'Internal server error' : err.message,
    });
  });

  /* ── database + listen ──────────────────────────────────── */
  const PORT = process.env.PORT || 5000;

  mongoose
    .connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    .then(() => console.log('[db] mongodb connected'))
    .catch((err) => {
      console.error('[db] connection failed:', err.message);
      process.exit(1);
    });

  mongoose.connection.on('error', (err) => {
    console.error('[db] runtime error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected — reconnecting…');
  });

  const server = app.listen(PORT, () => {
    console.log(`[server] listening on :${PORT} (pid ${process.pid})`);
  });

  /* ── graceful shutdown ──────────────────────────────────── */
  const shutdown = (sig) => {
    console.log(`\n[${sig}] shutting down…`);
    server.close(() => {
      mongoose.connection.close(false).then(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 8000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}
