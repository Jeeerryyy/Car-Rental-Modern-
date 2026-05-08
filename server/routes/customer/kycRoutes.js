const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../../config/env');
const Customer = require('../../models/Customer');
const { customerProtect } = require('../../middleware/auth');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/upload', customerProtect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: 'Only image and PDF files are allowed' });
    }
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'customers/kyc' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });
    
    if (req.customer.idDocument?.publicId) {
      await cloudinary.uploader.destroy(req.customer.idDocument.publicId);
    }
    
    req.customer.idDocument = { url: result.secure_url, publicId: result.public_id };
    req.customer.idVerificationStatus = 'pending';
    await req.customer.save();
    
    res.json({ success: true, message: 'Document uploaded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to upload document' });
  }
});

module.exports = router;