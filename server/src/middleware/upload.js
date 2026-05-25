import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_LIMITS } from '../utils/constants.js';
import { AppError } from '../utils/AppError.js';

const memoryStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, WebP, and PDF are allowed.', 400), false);
  }
};

export const uploadCarImages = multer({
  storage: memoryStorage,
  limits: { fileSize: UPLOAD_LIMITS.IMAGES },
  fileFilter: imageFileFilter
}).array('images', UPLOAD_LIMITS.MAX_IMAGES);

export const uploadProfileImage = multer({
  storage: memoryStorage,
  limits: { fileSize: UPLOAD_LIMITS.IMAGES },
  fileFilter: imageFileFilter
}).single('profileImage');

export const uploadDocument = multer({
  storage: memoryStorage,
  limits: { fileSize: UPLOAD_LIMITS.DOCUMENTS },
  fileFilter: documentFileFilter
}).array('documents', 10);

export const generatePublicId = (folder, filename) => {
  const ext = path.extname(filename);
  return `${folder}/${uuidv4()}${ext}`;
};
