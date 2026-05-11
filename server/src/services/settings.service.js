import Settings from '../models/Settings.js';
import { AppError } from '../utils/AppError.js';

export const getSettings = async (ownerId) => {
  let settings = await Settings.findOne({ owner: ownerId });

  if (!settings) {
    settings = await Settings.create({ owner: ownerId });
  }

  return settings;
};

export const updateSettings = async (ownerId, updates) => {
  let settings = await Settings.findOne({ owner: ownerId });

  if (!settings) {
    settings = await Settings.create({ owner: ownerId, ...updates });
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }

  return settings;
};

export const initializeDefaultSettings = async (ownerId) => {
  const existing = await Settings.findOne({ owner: ownerId });
  if (existing) {
    return existing;
  }

  const settings = await Settings.create({
    owner: ownerId,
    workingHours: {
      monday: { open: '09:00', close: '21:00', isOpen: true },
      tuesday: { open: '09:00', close: '21:00', isOpen: true },
      wednesday: { open: '09:00', close: '21:00', isOpen: true },
      thursday: { open: '09:00', close: '21:00', isOpen: true },
      friday: { open: '09:00', close: '21:00', isOpen: true },
      saturday: { open: '09:00', close: '21:00', isOpen: true },
      sunday: { open: '10:00', close: '18:00', isOpen: true }
    }
  });

  return settings;
};
