import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  actor: {
    type: String,
    required: true,
    index: true
  },
  actorType: {
    type: String,
    enum: ['customer', 'owner', 'staff', 'system'],
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ip: String,
  userAgent: String,
  correlationId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

// Prevent updates to audit logs (Immutable constraint)
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are immutable and cannot be modified.'));
  }
  next();
});

// Prevent deletion of audit logs (Immutable constraint)
auditLogSchema.pre('deleteOne', function (next) {
  return next(new Error('Audit logs are immutable and cannot be deleted.'));
});

auditLogSchema.pre('deleteMany', function (next) {
  return next(new Error('Audit logs are immutable and cannot be deleted.'));
});

auditLogSchema.pre('findOneAndDelete', function (next) {
  return next(new Error('Audit logs are immutable and cannot be deleted.'));
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
