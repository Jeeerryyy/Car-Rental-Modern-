import cloudinary from '../config/cloudinary.js';
import { CLOUDINARY_FOLDERS } from '../utils/constants.js';

export const uploadImage = async (fileBuffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result.result === 'ok';
  } catch (error) {
    console.error('Cloudinary delete error:', error);
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
    console.error('Cloudinary bulk delete error:', error);
    return false;
  }
};

export const uploadCarImages = async (files) => {
  const uploadedImages = [];
  for (const file of files) {
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const result = await uploadImage(file.buffer, CLOUDINARY_FOLDERS.CAR_IMAGES, uniqueId);
    uploadedImages.push(result);
  }
  return uploadedImages;
};

export const uploadProfileImage = async (file) => {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return uploadImage(file.buffer, CLOUDINARY_FOLDERS.PROFILE_IMAGES, uniqueId);
};

export const uploadDocument = async (file) => {
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return uploadImage(file.buffer, CLOUDINARY_FOLDERS.DOCUMENTS, uniqueId);
};
