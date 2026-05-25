import mongoose from 'mongoose';

const failedJobSchema = new mongoose.Schema({
  queueName: {
    type: String,
    required: true,
    index: true
  },
  jobId: String,
  jobName: {
    type: String,
    required: true,
    index: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  failedReason: String,
  stacktrace: [String],
  attemptsMade: Number,
  correlationId: String,
  failedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: false
});

const FailedJob = mongoose.model('FailedJob', failedJobSchema);

export default FailedJob;
