/**
 * File Upload Middleware - Multer configuration for local/Cloudinary storage
 * @module middleware/upload
 */

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  const cloudinary = require('../config/cloudinary');
  
  const multerStorageCloudinary = require('multer-storage-cloudinary');
  const CloudinaryStorage = multerStorageCloudinary.default || multerStorageCloudinary;
  
  const createStorage = (folder) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `modern-selfdrive/${folder}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp'],
      resource_type: 'auto'
    },
  });
  
  storage = {
    aadhaar: createStorage('documents/aadhaar'),
    license: createStorage('documents/license'),
    vehicle: createStorage('vehicles'),
    invoice: createStorage('invoices'),
    reports: createStorage('reports'),
    kyc: createStorage('kyc'),
    default: createStorage('uploads')
  };
} else {
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname),
  });
}

const upload = {
  aadhaar: multer({ storage: storage.aadhaar || storage }),
  license: multer({ storage: storage.license || storage }),
  vehicle: multer({ storage: storage.vehicle || storage }),
  invoice: multer({ storage: storage.invoice || storage }),
  reports: multer({ storage: storage.reports || storage }),
  kyc: multer({ storage: storage.kyc || storage }),
  single: (fieldName) => multer({ storage: storage.default || storage }).single(fieldName),
  array: (fieldName, maxCount) => multer({ storage: storage.default || storage }).array(fieldName, maxCount)
};

module.exports = upload;