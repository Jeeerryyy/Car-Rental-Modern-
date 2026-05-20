import { getRevenueReport, getFleetReport, getBookingsReport, exportBookingsCSV, getDashboardStats } from '../services/report.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

export const dashboardStats = catchAsync(async (req, res) => {
  const stats = await getDashboardStats(req.owner._id);
  return ApiResponse.success(res, 200, 'Dashboard stats retrieved', stats);
});

export const revenue = catchAsync(async (req, res) => {
  const report = await getRevenueReport(req.owner._id, req.query.startDate, req.query.endDate);
  return ApiResponse.success(res, 200, 'Revenue report retrieved', report);
});

export const fleet = catchAsync(async (req, res) => {
  const report = await getFleetReport(req.owner._id);
  return ApiResponse.success(res, 200, 'Fleet report retrieved', report);
});

export const bookings = catchAsync(async (req, res) => {
  const report = await getBookingsReport(req.owner._id, req.query.startDate, req.query.endDate);
  return ApiResponse.success(res, 200, 'Bookings report retrieved', report);
});

export const csv = catchAsync(async (req, res) => {
  const csvData = await exportBookingsCSV(req.owner._id, req.query.startDate, req.query.endDate);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
  return res.send(csvData);
});
