import { v2 as cloudinary } from 'cloudinary';
import { config } from './env.js';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName?.trim(),
  api_key: config.cloudinary.apiKey?.trim(),
  api_secret: config.cloudinary.apiSecret?.trim()
});

export default cloudinary;
