import { renderInvoiceHTML, getInvoiceData } from '../services/invoice.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

/**
 * GET /bookings/:id/invoice
 * Returns the rendered invoice as a standalone HTML page (for print/PDF)
 */
export const getInvoiceHTML = catchAsync(async (req, res) => {
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const html = await renderInvoiceHTML(req.params.id, userId);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

/**
 * GET /bookings/:id/invoice/data
 * Returns structured invoice data as JSON
 */
export const getInvoiceJSON = catchAsync(async (req, res) => {
  const userId = req.customer?._id || req.owner?._id || req.user?._id;
  const data = await getInvoiceData(req.params.id, userId);
  return ApiResponse.success(res, 200, 'Invoice data retrieved', { invoice: data });
});
