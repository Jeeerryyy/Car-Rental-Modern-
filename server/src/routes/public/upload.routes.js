import { Router } from 'express';
import { uploadDocument } from '../../middleware/upload.js';
import { uploadDocument as uploadToCloudinary } from '../../services/cloudinary.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { catchAsync } from '../../utils/catchAsync.js';
import { protect } from '../../middleware/auth.js';

const router = Router();

router.post('/', protect, uploadDocument, catchAsync(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return ApiResponse.error(res, 400, 'No files uploaded');
  }

  const results = [];
  for (const file of req.files) {
    const result = await uploadToCloudinary(file);
    results.push(result);
  }

  return ApiResponse.success(res, 200, 'Files uploaded successfully', { files: results });
}));

export default router;
