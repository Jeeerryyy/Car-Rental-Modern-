import { logger } from './logger.js';

/**
 * Checks magic numbers to ensure the file buffer matches allowed MIME types.
 * Supports JPEG, PNG, WebP, and PDF.
 * @param {Buffer} buffer 
 * @param {string[]} allowedTypes 
 * @returns {boolean}
 */
export const validateBufferMime = (buffer, allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']) => {
  if (!buffer || buffer.length < 4) {
    logger.warn('[File Scanner] File buffer too small to check signatures');
    return false;
  }

  const hex = buffer.toString('hex', 0, 12).toUpperCase();
  let detectedType = null;

  if (hex.startsWith('89504E470D0A1A0A')) {
    detectedType = 'image/png';
  } else if (hex.startsWith('FFD8FF')) {
    detectedType = 'image/jpeg';
  } else if (hex.startsWith('25504446')) {
    detectedType = 'application/pdf';
  } else if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') {
    // RIFF .... WEBP
    detectedType = 'image/webp';
  }

  if (!detectedType) {
    logger.warn(`[File Scanner] Unrecognized file signature: ${hex.substring(0, 16)}`);
    return false;
  }

  const isValid = allowedTypes.includes(detectedType);
  if (!isValid) {
    logger.warn(`[File Scanner] Disallowed file type "${detectedType}". Required one of: ${allowedTypes.join(', ')}`);
  }

  return isValid;
};

/**
 * Performs malicious payload detection.
 * Blocks:
 *  - PE executables (starting with MZ / 4D5A)
 *  - PHP tag code injection
 *  - HTML/JS script tags (polyglot payloads)
 * @param {Buffer} buffer 
 * @returns {boolean} True if clean, false if threat is detected.
 */
export const scanForThreats = (buffer) => {
  if (!buffer || buffer.length === 0) return true;

  // 1. Check for executable header (MZ signature)
  const hexPrefix = buffer.toString('hex', 0, 2).toUpperCase();
  if (hexPrefix === '4D5A') {
    logger.error('[File Scanner] Blocked PE executableMZ payload upload');
    return false;
  }

  // 2. Scan file content as string for script/polyglot tags
  const content = buffer.toString('ascii').toLowerCase();
  
  const maliciousPatterns = [
    '<script',
    '<?php',
    'eval(',
    'exec(',
    'system(',
    'passthru(',
    'shell_exec(',
    'base64_decode(',
    'javascript:'
  ];

  for (const pattern of maliciousPatterns) {
    if (content.includes(pattern)) {
      logger.error(`[File Scanner] Threat detected: Payload contains signature "${pattern}"`);
      return false;
    }
  }

  return true;
};

/**
 * Validates a base64 upload payload.
 * @param {string} base64Data - Raw base64 string or Data URI.
 * @param {number} maxSizeBytes - Maximum size limit in bytes.
 * @param {string[]} allowedTypes - List of permitted MIME types.
 * @returns {Buffer|null} Parsed buffer if valid and clean, null otherwise.
 */
export const scanAndValidateUpload = (base64Data, maxSizeBytes, allowedTypes) => {
  if (!base64Data) return null;

  try {
    // Strip Data URI prefix if present
    const cleanBase64 = base64Data.replace(/^data:[^,]+,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    // 1. Enforce size limits
    if (buffer.length > maxSizeBytes) {
      logger.warn(`[File Scanner] File exceeds size limits: ${buffer.length} bytes (max: ${maxSizeBytes})`);
      return null;
    }

    // 2. Validate MIME via magic bytes
    if (!validateBufferMime(buffer, allowedTypes)) {
      return null;
    }

    // 3. Scan for malicious signatures
    if (!scanForThreats(buffer)) {
      return null;
    }

    return buffer;
  } catch (err) {
    logger.error(`[File Scanner] Scan processing error: ${err.message}`);
    return null;
  }
};

export default {
  validateBufferMime,
  scanForThreats,
  scanAndValidateUpload
};
