import crypto from 'crypto';
import cacheService from '../config/redis.js';
import { logger } from './logger.js';

/**
 * SHA-256 hashes a token string for safe key storage.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Blacklists a JWT token until its expiration.
 * @param {string} token 
 * @param {number} expirySeconds 
 */
export const blacklistToken = async (token, expirySeconds = 86400) => {
  if (!token) return;
  const hash = hashToken(token);
  try {
    await cacheService.set(`blacklist:${hash}`, 'true', expirySeconds);
    logger.info(`[Token Revocation] Blacklisted token hash: ${hash}`);
  } catch (err) {
    logger.error(`[Token Revocation] Failed to blacklist token: ${err.message}`);
  }
};

/**
 * Checks if a JWT token is blacklisted.
 * @param {string} token 
 * @returns {Promise<boolean>}
 */
export const isTokenBlacklisted = async (token) => {
  if (!token) return false;
  const hash = hashToken(token);
  try {
    const result = await cacheService.get(`blacklist:${hash}`);
    return result === 'true';
  } catch (err) {
    logger.error(`[Token Revocation] Blacklist check error: ${err.message}`);
    return false; // Fail open to avoid breaking auth on cache outage (circuit status)
  }
};

/**
 * Revokes all sessions for a user by setting a revocation timestamp.
 * Any token issued before this timestamp will be rejected.
 * @param {string} userId 
 */
export const revokeAllUserSessions = async (userId) => {
  if (!userId) return;
  try {
    const now = Date.now();
    await cacheService.set(`user:revoked-before:${userId}`, now.toString(), 30 * 24 * 3600); // 30 days retention
    logger.info(`[Token Revocation] Revoked all sessions for user ${userId} before timestamp: ${now}`);
  } catch (err) {
    logger.error(`[Token Revocation] Failed to revoke sessions: ${err.message}`);
  }
};

/**
 * Checks if the user's session was revoked before the token issuance time.
 * @param {string} userId 
 * @param {number} tokenIat - Token issued-at timestamp (seconds since epoch)
 * @returns {Promise<boolean>}
 */
export const isUserSessionRevoked = async (userId, tokenIat) => {
  if (!userId || !tokenIat) return false;
  try {
    const revokedBeforeStr = await cacheService.get(`user:revoked-before:${userId}`);
    if (revokedBeforeStr) {
      const revokedBefore = parseInt(revokedBeforeStr, 10);
      return (tokenIat * 1000) < revokedBefore;
    }
    return false;
  } catch (err) {
    logger.error(`[Token Revocation] Revocation timestamp check failed: ${err.message}`);
    return false;
  }
};

export default {
  blacklistToken,
  isTokenBlacklisted,
  revokeAllUserSessions,
  isUserSessionRevoked
};
