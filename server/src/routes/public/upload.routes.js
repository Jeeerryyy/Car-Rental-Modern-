import { Router } from 'express';
import { uploadDocument, uploadCarImages, uploadProfileImage } from '../../services/cloudinary.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { protect, restrictTo } from '../../middleware/auth.js';
import { USER_ROLES } from '../../utils/constants.js';

const router = Router();

router.post('/car-images', protect, restrictTo(USER_ROLES.OWNER), catchAsync(async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return ApiResponse.error(res, 400, 'No images provided');
  }

  const results = [];
  for (const imageData of images) {
    if (imageData && typeof imageData === 'string' && imageData.startsWith('data:')) {
      const base64Data = imageData.replace(/^data:[^,]+,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const file = { buffer };
      const result = await uploadCarImages([file]);
      results.push(result[0]);
    }
  }

  return ApiResponse.success(res, 200, 'Car images uploaded', { files: results });
}));

router.post('/profile-image', protect, catchAsync(async (req, res) => {
  const { profileImage } = req.body;

  if (!profileImage || !profileImage.startsWith('data:')) {
    return ApiResponse.error(res, 400, 'Invalid profile image data');
  }

  const base64Data = profileImage.replace(/^data:[^,]+,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const file = { buffer };

  const result = await uploadProfileImage(file);

  return ApiResponse.success(res, 200, 'Profile image uploaded', { file: result });
}));

router.post('/document', protect, catchAsync(async (req, res) => {
  const { aadhar, license } = req.body;

  const results = { aadhar: null, license: null };

  if (aadhar && typeof aadhar === 'string' && aadhar.startsWith('data:')) {
    const base64Data = aadhar.replace(/^data:[^,]+,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    results.aadhar = await uploadDocument(buffer);
  }

  if (license && typeof license === 'string' && license.startsWith('data:')) {
    const base64Data = license.replace(/^data:[^,]+,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    results.license = await uploadDocument(buffer);
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

  if (!signature || !signature.startsWith('data:')) {
    return ApiResponse.error(res, 400, 'Invalid signature data');
  }

  const base64Data = signature.replace(/^data:[^,]+,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  const result = await uploadDocument(buffer);

  return ApiResponse.success(res, 200, 'Signature uploaded', { files: { signature: result } });
}));

export default router;