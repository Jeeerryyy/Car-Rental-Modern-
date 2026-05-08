const Newsletter = require('../models/Newsletter');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.subscribe = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email', 400));
  }

  // Use updateOne with upsert to ignore duplicates without throwing error
  await Newsletter.updateOne(
    { email },
    { $setOnInsert: { email } },
    { upsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Successfully subscribed to newsletter'
  });
});
