const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  action: { 
    type: String, 
    required: true,
    enum: [
      'USER_LOGIN', 'USER_LOGOUT', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
      'CAR_CREATED', 'CAR_UPDATED', 'CAR_DELETED', 'CAR_STATUS_CHANGED',
      'BOOKING_CREATED', 'BOOKING_UPDATED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED',
      'PROMO_CREATED', 'PROMO_UPDATED', 'PROMO_DELETED',
      'PAYMENT_RECEIVED', 'REFUND_ISSUED',
      'SETTINGS_UPDATED', 'DATA_EXPORTED'
    ]
  },
  resourceType: { type: String, enum: ['User', 'Car', 'Booking', 'Promo', 'Settings', 'Payment'] },
  resourceId: { type: String },
  details: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  status: { type: String, enum: ['success', 'failure'], default: 'success' },
  errorMessage: { type: String }
}, { timestamps: true });

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

const logAction = async (data) => {
  try {
    const log = await AuditLog.create(data);
    return log;
  } catch (error) {
    console.error('[AUDIT] Failed to create audit log:', error);
  }
};

const logAdminAction = async (user, action, resourceType, resourceId, details = {}) => {
  return logAction({
    userId: user._id,
    userEmail: user.email,
    action,
    resourceType,
    resourceId: resourceId?.toString(),
    details,
    ipAddress: details.ipAddress,
    userAgent: details.userAgent
  });
};

const getAuditLogs = async (filters = {}, options = {}) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await AuditLog.countDocuments(filters);

  return { logs, total, page, limit, pages: Math.ceil(total / limit) };
};

module.exports = {
  AuditLog,
  logAction,
  logAdminAction,
  getAuditLogs
};