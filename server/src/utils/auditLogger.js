import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import AuditLog from '../models/AuditLog.js';
import { getTraceContext } from '../middleware/correlation.middleware.js';
import { logger } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '../../logs');

// Create a dedicated audit logger for secure file streaming
const auditWinston = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'audit.log'),
      maxsize: 20971520, // 20MB
      maxFiles: 50
    })
  ]
});

/**
 * Commits a structured event record to both file stream and Mongoose DB storage.
 * @param {string} action - Action name (e.g., 'auth.login_failed')
 * @param {string} actor - ID or identification string of executor
 * @param {string} actorType - Type of executor ('customer' | 'owner' | 'staff' | 'system')
 * @param {Object} details - Additional metadata parameters
 * @param {Object} req - Express Request object (optional)
 */
export const logAudit = async (action, actor, actorType, details = {}, req = null) => {
  const trace = getTraceContext();
  const correlationId = trace ? trace.correlationId : null;
  const ip = req ? (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null;
  const userAgent = req ? req.headers['user-agent'] : null;

  const payload = {
    action,
    actor,
    actorType,
    details,
    ip,
    userAgent,
    correlationId,
    timestamp: new Date()
  };

  // 1. Commit to immutable disk file
  auditWinston.info(payload);

  // 2. Commit to database for operational searches
  try {
    await AuditLog.create(payload);
  } catch (err) {
    logger.error(`[Audit Log] Database write failure: ${err.message}`, { action, actor });
  }
};

export default logAudit;
