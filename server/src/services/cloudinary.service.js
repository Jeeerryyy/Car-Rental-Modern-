import cloudinary from '../config/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export const uploadImage = async (fileBuffer, folder, publicId) => {
  try {
    const base64Image = fileBuffer.toString('base64');
    const dataUri = `data:image/jpeg;base64,${base64Image}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      public_id: publicId,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    });
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
