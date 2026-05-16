import Owner from '../models/Owner.js';
import { AppError } from '../utils/AppError.js';
import { USER_ROLES } from '../utils/constants.js';

/**
 * Get all staff members for an owner
 */
export const getStaffMembers = async (ownerId) => {
  return await Owner.find({ parentOwner: ownerId, role: USER_ROLES.STAFF }).select('-password');
};

/**
 * Create a new staff member
 */
export const createStaffMember = async (ownerId, staffData) => {
  // Check if owner already has 2 staff members
  const count = await Owner.countDocuments({ parentOwner: ownerId, role: USER_ROLES.STAFF });
  if (count >= 2) {
    throw new AppError('You can only have a maximum of 2 staff members', 400);
  }

  // Check if email already exists
  const existing = await Owner.findOne({ email: staffData.email.toLowerCase() });
  if (existing) {
    throw new AppError('Email already in use', 400);
  }

  const staff = await Owner.create({
    ...staffData,
    role: USER_ROLES.STAFF,
    parentOwner: ownerId,
    isActive: true
  });

  const staffObj = staff.toObject();
  delete staffObj.password;
  return staffObj;
};

/**
 * Toggle staff status (active/inactive)
 */
export const toggleStaffStatus = async (staffId, ownerId) => {
  const staff = await Owner.findOne({ _id: staffId, parentOwner: ownerId });
  if (!staff) {
    throw new AppError('Staff member not found', 404);
  }

  staff.isActive = !staff.isActive;
  await staff.save();

  return staff;
};

/**
 * Delete a staff member
 */
export const deleteStaffMember = async (staffId, ownerId) => {
  const staff = await Owner.findOneAndDelete({ _id: staffId, parentOwner: ownerId });
  if (!staff) {
    throw new AppError('Staff member not found', 404);
  }
  return staff;
};
