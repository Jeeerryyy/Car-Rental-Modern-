import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_LIMITS } from '../utils/constants.js';

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
  }
};

export const uploadCarImages = multer({
  storage: memoryStorage,
  limits: { fileSize: UPLOAD_LIMITS.IMAGES },
  fileFilter
}).array('images', UPLOAD_LIMITS.MAX_IMAGES);

export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: { fileSize: UPLOAD_LIMITS.IMAGES },
  fileFilter
}).single('profileImage');

export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: UPLOAD_LIMITS.DOCUMENTS },
  fileFilter
}).array('documents', 10);

export const generatePublicId = (folder, filename) => {
  const ext = path.extname(filename);
  return `${folder}/${uuidv4()}${ext}`;
};
