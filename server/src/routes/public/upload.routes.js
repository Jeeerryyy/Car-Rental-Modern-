import { Router } from 'express';
import { uploadDocument, uploadCarImages, uploadProfileImage } from '../../services/cloudinary.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';
import { scanAndValidateUpload } from '../../utils/fileScanner.js';
import { uploadFailuresCounter } from '../../config/metrics.js';

const router = Router();

router.post('/car-images', protect, restrictTo(USER_ROLES.OWNER), catchAsync(async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return ApiResponse.error(res, 400, 'No images provided');
  }

  const results = [];
  for (const imageData of images) {
    if (imageData && typeof imageData === 'string') {
      const cleanBuffer = scanAndValidateUpload(imageData, 10 * 1024 * 1024, ['image/jpeg', 'image/png', 'image/webp']);
      if (!cleanBuffer) {
        uploadFailuresCounter.inc({ reason: 'malicious_or_invalid_type' });
        return ApiResponse.error(res, 400, 'Invalid, oversized or malicious car image payload');
      }
      const file = { buffer: cleanBuffer };
      const result = await uploadCarImages([file]);
      results.push(result[0]);
    }
  }

  return ApiResponse.success(res, 200, 'Car images uploaded', { files: results });
}));

router.post('/profile-image', protect, catchAsync(async (req, res) => {
  const { profileImage } = req.body;

  if (!profileImage) {
    return ApiResponse.error(res, 400, 'No profile image data provided');
  }

  const cleanBuffer = scanAndValidateUpload(profileImage, 2 * 1024 * 1024, ['image/jpeg', 'image/png', 'image/webp']);
  if (!cleanBuffer) {
    uploadFailuresCounter.inc({ reason: 'malicious_or_invalid_type' });
    return ApiResponse.error(res, 400, 'Invalid, oversized or malicious profile image payload');
  }

  const file = { buffer: cleanBuffer };
  const result = await uploadProfileImage(file);

  return ApiResponse.success(res, 200, 'Profile image uploaded', { file: result });
}));

router.post('/document', protect, catchAsync(async (req, res) => {
  const { aadhar, license } = req.body;

  const results = { aadhar: null, license: null };

  if (aadhar && typeof aadhar === 'string') {
    const cleanBuffer = scanAndValidateUpload(aadhar, 5 * 1024 * 1024, ['image/jpeg', 'image/png', 'application/pdf']);
    if (!cleanBuffer) {
      uploadFailuresCounter.inc({ reason: 'malicious_or_invalid_type' });
      return ApiResponse.error(res, 400, 'Invalid, oversized or malicious Aadhar document payload');
    }
    results.aadhar = await uploadDocument(cleanBuffer);
  }

  if (license && typeof license === 'string') {
    const cleanBuffer = scanAndValidateUpload(license, 5 * 1024 * 1024, ['image/jpeg', 'image/png', 'application/pdf']);
    if (!cleanBuffer) {
      uploadFailuresCounter.inc({ reason: 'malicious_or_invalid_type' });
      return ApiResponse.error(res, 400, 'Invalid, oversized or malicious License document payload');
    }
    results.license = await uploadDocument(cleanBuffer);
  }

  return ApiResponse.success(res, 200, 'Documents uploaded', {
    files: {
      aadhar: results.aadhar,
      license: results.license,
    }
  });
}));

router.post('/signature', protect, catchAsync(async (req, res) => {
  const { signature } = req.body;

  if (!signature) {
    return ApiResponse.error(res, 400, 'No signature data provided');
  }

  const cleanBuffer = scanAndValidateUpload(signature, 1 * 1024 * 1024, ['image/png', 'image/jpeg']);
  if (!cleanBuffer) {
    uploadFailuresCounter.inc({ reason: 'malicious_or_invalid_type' });
    return ApiResponse.error(res, 400, 'Invalid, oversized or malicious signature payload');
  }

  const result = await uploadDocument(cleanBuffer);

  return ApiResponse.success(res, 200, 'Signature uploaded', { files: { signature: result } });
}));

export default router;