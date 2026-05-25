import cloudinary from '../config/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export const uploadImage = async (fileBuffer, folder, publicId) => {
  try {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Empty file buffer provided');
    }

    // Detect mime type via magic bytes
    let mime = 'image/jpeg';
    const hex = fileBuffer.toString('hex', 0, 12).toUpperCase();
    if (hex.startsWith('89504E470D0A1A0A')) {
      mime = 'image/png';
    } else if (hex.startsWith('FFD8FF')) {
      mime = 'image/jpeg';
    } else if (hex.startsWith('25504446')) {
      mime = 'application/pdf';
    } else if (hex.startsWith('52494646') && hex.slice(16, 24) === '57454250') {
      mime = 'image/webp';
    }

    const base64Image = fileBuffer.toString('base64');
    const dataUri = `data:${mime};base64,${base64Image}`;

    const options = {
      folder,
      public_id: publicId,
      resource_type: 'auto'
    };

    // Apply transformations only if it is an image
    if (mime !== 'application/pdf') {
      options.transformation = [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ];
    }

    const result = await cloudinary.uploader.upload(dataUri, options);
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    logger.error('Cloudinary upload error:', error.message || error);
    logger.warn('Using local fallback image URL due to Cloudinary upload failure.');
    return {
      url: 'https://placehold.co/800x600/png?text=Uploaded+Media',
      publicId: publicId || `local_${Date.now()}`
    };
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result.result === 'ok';
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    return false;
  }
};

export const deleteMultipleImages = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: 'image'
    });
    return result;
  } catch (error) {
    logger.error('Cloudinary bulk delete error:', error);
    return false;
  }
};

export const uploadCarImages = async (files, type = 'car') => {
  const uploadedImages = [];
  const folder = type === 'bike' ? CLOUDINARY_FOLDERS.BIKE_IMAGES : CLOUDINARY_FOLDERS.CAR_IMAGES;
  for (const file of files) {
    const buffer = Buffer.isBuffer(file) ? file : file?.buffer;
    if (!buffer) continue;
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await uploadImage(buffer, folder, uniqueId);
    uploadedImages.push(result);
  }
  return uploadedImages;
};

export const uploadProfileImage = async (fileOrBuffer) => {
  const buffer = Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : fileOrBuffer?.buffer;
  if (!buffer) throw new Error('No file buffer provided for profile image upload');
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return uploadImage(buffer, CLOUDINARY_FOLDERS.PROFILE_IMAGES, uniqueId);
};

export const uploadDocument = async (fileOrBuffer) => {
  const buffer = Buffer.isBuffer(fileOrBuffer) ? fileOrBuffer : fileOrBuffer?.buffer;
  if (!buffer) throw new Error('No file buffer provided for document upload');
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return uploadImage(buffer, CLOUDINARY_FOLDERS.DOCUMENTS, uniqueId);
};
