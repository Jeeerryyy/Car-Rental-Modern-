import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file',
];

export const syncToGoogleSheet = async (sheetTitle, data) => {
  if (!config.google?.sheetId || !config.google?.serviceAccountEmail || !config.google?.privateKey) {
    logger.warn('[GoogleSheet] Missing credentials. Skipping sync.');
    return;
  }

  try {
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

    // Clear existing data (optional, but for backup we usually overwrite or append)
    // For a daily backup, overwriting the "Current Status" sheet is often cleaner.
    await sheet.clear();
    
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      await sheet.setHeaderRow(headers);
      await sheet.addRows(data);
    }

    logger.info(`[GoogleSheet] Successfully synced ${data.length} records to "${sheetTitle}"`);
  } catch (error) {
    logger.error(`[GoogleSheet] Sync failed: ${error.message}`);
    throw error;
  }
};
