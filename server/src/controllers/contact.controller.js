import Contact from '../models/Contact.js';
import Owner from '../models/Owner.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { createNotification } from '../services/notification.service.js';
import { getIO } from '../config/socket.js';

export const submitContact = catchAsync(async (req, res) => {
  const contact = await Contact.create(req.body);

  // Notify owner
  try {
    const owner = await Owner.findOne({ role: 'owner' });
    if (owner) {
      await createNotification(
        owner._id,
        'Owner',
        'system',
        'New Client Inquiry',
        `${contact.name} sent a new message: "${contact.subject}"`,
        `/clients`
      );
      
      // Emit real-time event for Clients page
      getIO().to(`owner:${owner._id}`).emit('client:new', contact);
    }
  } catch (err) {
    console.error('Notification error:', err);
  }

  return ApiResponse.success(res, 201, 'Message received', { contact });
});

export const getOwnerContacts = catchAsync(async (req, res) => {
  const pagination = { page: parseInt(req.query.page) || 1, limit: parseInt(req.query.limit) || 20 };
  const skip = (pagination.page - 1) * pagination.limit;
  const total = await Contact.countDocuments();
  const contacts = await Contact.find().skip(skip).limit(pagination.limit).sort({ createdAt: -1 });
  return ApiResponse.success(res, 200, 'Contacts retrieved', contacts, { ...pagination, total, pages: Math.ceil(total / pagination.limit) });
});

export const updateContactStatus = catchAsync(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  return ApiResponse.success(res, 200, 'Contact updated', { contact });
});
