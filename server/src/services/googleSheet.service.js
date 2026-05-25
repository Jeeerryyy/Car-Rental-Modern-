import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { googleSheetsBreaker } from '../utils/resilience.js';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

const performSync = async (sheetTitle, data) => {
  const serviceAccountAuth = new JWT({
    email: config.google.serviceAccountEmail,
    key: config.google.privateKey.replace(/\\n/g, '\n'),
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(config.google.sheetId, serviceAccountAuth);
  await doc.loadInfo();

  let sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet) {
    sheet = await doc.addSheet({ title: sheetTitle });
  }

  // Clear existing data
  await sheet.clear();
  
  if (data.length > 0) {
    const headers = Object.keys(data[0]);
    await sheet.setHeaderRow(headers);
    await sheet.addRows(data);
  }
};

export const syncToGoogleSheet = async (sheetTitle, data) => {
  if (!config.google?.sheetId || !config.google?.serviceAccountEmail || !config.google?.privateKey) {
    logger.warn('[GoogleSheet] Missing credentials. Skipping sync.');
    return;
  }

  try {
    await googleSheetsBreaker.fire(performSync, sheetTitle, data);
    logger.info(`[GoogleSheet] Successfully synced ${data.length} records to "${sheetTitle}"`);
  } catch (error) {
    logger.error(`[GoogleSheet] Sync failed: ${error.message}`);
    throw error;
  }
};
