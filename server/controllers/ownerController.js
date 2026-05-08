const ownerService = require('../services/ownerService');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await ownerService.getDashboardKPIs();
  
  res.status(200).json({
    success: true,
    data: stats
  });
});

exports.getClients = catchAsync(async (req, res, next) => {
  const clients = await ownerService.getClients();
  
  res.status(200).json({
    success: true,
    data: { clients }
  });
});
