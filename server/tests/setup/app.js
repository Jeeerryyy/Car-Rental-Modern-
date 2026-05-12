/**
 * Test-only Express app instance.
 * Creates the same middleware stack as server.js but does NOT:
 *   - Call startServer() / listen()
 *   - Connect to real MongoDB
 *   - Initialize Socket.io on a real HTTP server
 *   - Start cron jobs
 *
 * Socket.io's getIO() is mocked globally so services that emit events don't crash.
 */
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import routes from '../../src/routes/index.js';
import { errorHandler, notFoundHandler } from '../../src/middleware/errorHandler.js';

const app = express();

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Test server is running' });
});

// Mount all API routes
app.use('/api', routes);

// Error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
