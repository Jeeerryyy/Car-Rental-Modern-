import transporter from '../config/email.js';
import { config } from '../config/env.js';

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: config.smtp.emailFrom,
      to,
      subject,
      html
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

const bookingEmailTemplate = (title, customerName, carName, bookingId, startDate, endDate, total, status) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Modern Drive</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2 style="color: #333;">${title}</h2>
    <p>Dear ${customerName},</p>
    <p>Your booking has been ${status}:</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p><strong>Vehicle:</strong> ${carName}</p>
      <p><strong>Dates:</strong> ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}</p>
      <p><strong>Total:</strong> ₹${total}</p>
    </div>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best regards,<br>Modern Drive Team</p>
  </div>
  <div style="background: #333; color: white; padding: 20px; text-align: center;">
    <p style="margin: 0;">© 2026 Modern Drive. All rights reserved.</p>
  </div>
</body>
</html>
`;

export const sendBookingConfirmation = async (customer, booking, car) => {
  const html = bookingEmailTemplate(
    'Booking Confirmed!',
    customer.name,
    `${car.make} ${car.model}`,
    booking._id.toString(),
    booking.startDate,
    booking.endDate,
    booking.totalPrice,
    'confirmed'
  );
  return sendEmail(customer.email, 'Booking Confirmed - Modern Drive', html);
};

export const sendBookingStatusUpdate = async (customer, booking, status) => {
  const html = bookingEmailTemplate(
    `Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    customer.name,
    '',
    booking._id.toString(),
    booking.startDate,
    booking.endDate,
    booking.totalPrice,
    status
  );
  return sendEmail(customer.email, `Booking Update - Modern Drive`, html);
};

export const sendBookingCancellation = async (customer, booking) => {
  const html = bookingEmailTemplate(
    'Booking Cancelled',
    customer.name,
    '',
    booking._id.toString(),
    booking.startDate,
    booking.endDate,
    booking.totalPrice,
    'cancelled'
  );
  return sendEmail(customer.email, 'Booking Cancelled - Modern Drive', html);
};

export const sendOwnerNewBooking = async (owner, booking, customer, car) => {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
    <h1 style="color: white; margin: 0;">Modern Drive</h1>
  </div>
  <div style="padding: 30px; background: #f9f9f9;">
    <h2 style="color: #333;">New Booking Received</h2>
    <p>Dear ${owner.name},</p>
    <p>A new booking has been placed:</p>
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Customer:</strong> ${customer.name}</p>
      <p><strong>Email:</strong> ${customer.email}</p>
      <p><strong>Vehicle:</strong> ${car.make} ${car.model}</p>
      <p><strong>Dates:</strong> ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}</p>
      <p><strong>Total:</strong> ₹${booking.totalPrice}</p>
    </div>
    <p>Please log in to your dashboard to manage this booking.</p>
  </div>
</body>
</html>
  `;
  return sendEmail(owner.email, 'New Booking - Modern Drive', html);
};

export const sendOwnerMessage = async (customer, subject, message, ownerName) => {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="padding: 30px; background: #f9f9f9;">
    <h2 style="color: #333;">Message from ${customer.name}</h2>
    <p><strong>Subject:</strong> ${subject}</p>
    <div style="background: white; padding: 20px; border-radius: 8px;">
      <p>${message}</p>
    </div>
    <p><strong>Customer Email:</strong> ${customer.email}</p>
  </div>
</body>
</html>
  `;
  return sendEmail(customer.email, `Message from ${ownerName}`, html);
};
