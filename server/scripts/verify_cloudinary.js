import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

console.log('=== Cloudinary Credential Check ===');
console.log(`CLOUD_NAME : "${cloudName}" (length: ${cloudName?.length})`);
console.log(`API_KEY    : "${apiKey}" (length: ${apiKey?.length})`);
console.log(`API_SECRET : "${apiSecret?.substring(0, 5)}..." (length: ${apiSecret?.length})`);

cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

console.log('\nTesting Cloudinary connection with ping...');
try {
  const result = await cloudinary.api.ping();
  console.log('✅ Cloudinary connection successful!', JSON.stringify(result));
} catch (err) {
  console.error('❌ Cloudinary connection FAILED');
  console.error('   Error message:', err?.message || err?.error?.message || 'unknown');
  console.error('   Full error:', JSON.stringify(err, null, 2));
}
