import { useState } from 'react';
import api from '../../services/api';
import { ArrowRightAltIcon, DownloadIcon } from './Icons';

const BookingCard = ({ booking, onCancel }) => {
  const isCancellable = booking.status === 'Upcoming' || booking.status === 'Pending';
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const statusStyles = {
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
    Active: 'bg-green-100 text-green-800 border-green-200',
    Completed: 'bg-gray-100 text-gray-800 border-gray-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200'
  };

  const cancelReasons = [
    'Change of plans',
    'Found another rental',
    'Emergency/Personal reason',
    'Vehicle not as expected',
    'Financial reason',
    'Other'
  ];

  const handleCancelSubmit = async () => {
    if (!cancelReason) return;
    setCancelling(true);
    try {
      await onCancel(booking._id, cancelReason);
      setShowCancelModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadReceipt = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const leftMargin = 15;
    const rightMargin = 195;

    const car = booking.carId || {};
    const fmt = (n) => Math.round(Number(n) || 0);
    const inr = (n) => '₹' + fmt(n).toLocaleString('en-IN');
    const days = Math.ceil((new Date(booking.dropoffDate) - new Date(booking.pickupDate)) / (1000 * 60 * 60 * 24)) || 1;
    const totalAmount = fmt(booking.totalAmount) + fmt(booking.securityDeposit || 1000);
    const totalWithGST = Math.round(totalAmount * 1.18);
    
    const numToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      const convert = (n) => {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
      };
      return convert(Math.floor(num));
    };

    const formatDate = (date) => {
      const d = new Date(date);
      const daysArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthsArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      return daysArr[d.getDay()] + ', ' + monthsArr[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    };

    doc.setFillColor(17, 17, 24);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(232, 224, 208);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('MODERN SELFDRIVE', leftMargin + 5, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Car Rental Services', leftMargin + 5, 25);
    doc.setFontSize(8);
    doc.text('GSTIN: 24JKMPS1234M1ZZ | PAN: JKMPS1234J', leftMargin + 5, 31);

    doc.setFontSize(8);
    doc.setTextColor(200, 195, 180);
    doc.text('Modern Selfdrive Hub, Near Bus Stand, Junagadh, Gujarat, India - 362001', rightMargin, 12, { align: 'right' });
    doc.text('+91 87924 92717 | info@modernselfdrive.com', rightMargin, 18, { align: 'right' });
    doc.text('SAC Code: 996601', rightMargin, 24, { align: 'right' });
    doc.text('www.modernselfdrive.com', rightMargin, 30, { align: 'right' });

    doc.setFillColor(35, 155, 90);
    doc.roundedRect(leftMargin, 40, 25, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TAX INVOICE', leftMargin + 3, 46.5);

    doc.setTextColor(17, 17, 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Invoice #' + booking.confirmationNumber, leftMargin + 30, 46);

    doc.setFillColor(246, 245, 242);
    doc.rect(0, 55, pageWidth, 35, 'F');

    doc.setFontSize(9);
    const detailsX = leftMargin + 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice Date:', detailsX, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(booking.createdAt), detailsX + 28, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Due Date:', detailsX + 85, 63);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(booking.pickupDate), detailsX + 113, 63);

    doc.setFont('helvetica', 'bold');
    doc.text('Booking Period:', detailsX, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(booking.pickupDate) + ' - ' + formatDate(booking.dropoffDate), detailsX + 35, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Total Days:', detailsX + 110, 70);
    doc.setFont('helvetica', 'normal');
    doc.text(days + ' Days', detailsX + 135, 70);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 17, 24);
    doc.setFillColor(17, 17, 24);
    doc.roundedRect(detailsX, 77, 35, 8, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('BILLED TO', detailsX + 3, 82);

    doc.setTextColor(89, 89, 102);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const userName = booking.userId?.name || 'Customer';
    doc.text(userName, detailsX, 92);
    doc.text('Booking ID: ' + booking.confirmationNumber, detailsX, 99);
    doc.text('Pickup: ' + (booking.pickupLocation || 'Modern Selfdrive Hub'), detailsX, 106);
    doc.text('Phone: ' + (booking.userId?.phone || '+91'), detailsX, 113);

    doc.setDrawColor(230, 230, 230);
    doc.rect(leftMargin + 42, 55, 148, 60);

    doc.setFillColor(17, 17, 24);
    doc.roundedRect(leftMargin + 47, 60, 30, 7, 1, 1, 'F');
    doc.setTextColor(232, 224, 208);
    doc.setFontSize(8);
    doc.text('VEHICLE DETAILS', leftMargin + 50, 64.5);

    doc.setTextColor(17, 17, 24);
    doc.setFontSize(9);
    doc.text('Vehicle:', leftMargin + 50, 74);
    doc.setFont('helvetica', 'bold');
    doc.text((car.make || '') + ' ' + (car.model || ''), leftMargin + 70, 74);
    doc.setFont('helvetica', 'normal');
    doc.text('Year: ' + (car.year || 'N/A'), leftMargin + 50, 81);
    doc.text('Transmission: ' + (car.transmission || 'Manual'), leftMargin + 50, 88);
    doc.text('Fuel: ' + (car.fuelType || 'Petrol'), leftMargin + 50, 95);

    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Category:', leftMargin + 90, 74);
    doc.setFont('helvetica', 'normal');
    doc.text('Self Drive Rental', leftMargin + 120, 74);
    doc.text('SAC: 996601', leftMargin + 120, 81);

    doc.setFillColor(246, 245, 242);
    doc.rect(leftMargin, 120, pageWidth, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(17, 17, 24);
    doc.text('Description', leftMargin + 5, 127);
    doc.text('Qty', leftMargin + 105, 127);
    doc.text('Rate', leftMargin + 120, 127);
    doc.text('Amount', rightMargin - 5, 127, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let y = 137;
    const baseAmt = fmt(booking.baseAmount);
    doc.text('Car Rental - ' + (car.make || '') + ' ' + (car.model || '') + ' (' + days + ' days)', leftMargin + 5, y);
    doc.text(days.toString(), leftMargin + 115, y);
    doc.text(inr(baseAmt / days), leftMargin + 125, y);
    doc.text(inr(baseAmt), rightMargin - 5, y, { align: 'right' });
    y += 7;
    
    doc.text('Security Deposit (Refundable)', leftMargin + 5, y);
    doc.text('1', leftMargin + 115, y);
    doc.text(inr(booking.securityDeposit || 1000), leftMargin + 125, y);
    doc.text(inr(booking.securityDeposit || 1000), rightMargin - 5, y, { align: 'right' });
    y += 7;

    if (booking.driverCharge) {
      doc.text('Driver Charges', leftMargin + 5, y);
      doc.text('1', leftMargin + 115, y);
      doc.text(inr(booking.driverCharge), leftMargin + 125, y);
      doc.text(inr(booking.driverCharge), rightMargin - 5, y, { align: 'right' });
      y += 7;
    }

    if (booking.discount) {
      doc.setTextColor(0, 120, 0);
      doc.text('Promotional Discount', leftMargin + 5, y);
      doc.text('-', leftMargin + 115, y);
      doc.text('-' + inr(booking.discount), leftMargin + 125, y);
      doc.text('-' + inr(booking.discount), rightMargin - 5, y, { align: 'right' });
      doc.setTextColor(17, 17, 24);
      y += 7;
    }

    doc.setDrawColor(200, 200, 200);
    doc.line(leftMargin + 5, y, rightMargin - 5, y);
    y += 7;

    const subtotal = baseAmt + (booking.driverCharge || 0) + (booking.securityDeposit || 1000) - (booking.discount || 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Sub Total', leftMargin + 5, y);
    doc.text(inr(subtotal), rightMargin - 5, y, { align: 'right' });
    y += 8;

    const cgst = Math.round(subtotal * 0.09);
    const sgst = Math.round(subtotal * 0.09);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('GST CGST (9%)', leftMargin + 5, y);
    doc.text(inr(cgst), rightMargin - 5, y, { align: 'right' });
    y += 6;
    doc.text('GST SGST (9%)', leftMargin + 5, y);
    doc.text(inr(sgst), rightMargin - 5, y, { align: 'right' });
    y += 8;

    doc.setFillColor(17, 17, 24);
    doc.rect(leftMargin, y, 180, 10, 'F');
    doc.setTextColor(232, 224, 208);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL AMOUNT (Incl. GST)', leftMargin + 5, y + 7);
    doc.setTextColor(255, 255, 255);
    doc.text(inr(subtotal + cgst + sgst), rightMargin - 5, y + 7, { align: 'right' });

    y += 18;
    doc.setTextColor(17, 17, 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Total Amount (in words):', leftMargin + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const totalWords = numToWords(subtotal + cgst + sgst);
    const paise = Math.round(((subtotal + cgst + sgst) % 1) * 100);
    const wordsText = paise > 0 ? totalWords + ' Rupees and ' + paise + ' Paise only' : totalWords + ' Rupees only';
    doc.text(wordsText.toUpperCase(), leftMargin + 5, y + 6);

    y += 20;
    doc.setFillColor(246, 245, 242);
    doc.roundedRect(leftMargin, y, 180, 35, 2, 2, 'F');
    doc.setTextColor(17, 17, 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Bank Details', leftMargin + 5, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);
    doc.text('Bank Name: HDFC Bank', leftMargin + 5, y + 13);
    doc.text('Account Name: Modern Selfdrive', leftMargin + 5, y + 18);
    doc.text('Account Number: 50200084327890', leftMargin + 5, y + 23);
    doc.text('IFSC Code: HDFC0001234', leftMargin + 5, y + 28);
    doc.text('UPI: modernselfdrive@hdfc', leftMargin + 90, y + 13);
    doc.text('GSTIN: 24JKMPS1234M1ZZ', leftMargin + 90, y + 18);
    doc.text('PAN: JKMPS1234J', leftMargin + 90, y + 23);

    y += 45;
    doc.setFillColor(17, 17, 24);
    doc.rect(0, 270, pageWidth, 27, 'F');
    doc.setTextColor(200, 195, 180);
    doc.setFontSize(8);
    doc.text('Thank you for choosing Modern Selfdrive! Drive safe.', 105, 280, { align: 'center' });
    doc.text('Terms: Vehicle must be returned in same condition. Security deposit refundable in 5-7 days. Late return charges ₹200/hr.', 105, 286, { align: 'center' });
    doc.setFontSize(7);
    doc.text('Generated: ' + formatDate(new Date()), 105, 292, { align: 'center' });

    doc.save(`Invoice-${booking.confirmationNumber}.pdf`);
  };

  return (
    <div className="bg-white rounded-[var(--radius-md)] overflow-hidden shadow-sm border border-border flex flex-col md:flex-row group">
      
      {/* Image Area */}
      <div className="w-full md:w-1/3 h-48 md:h-auto bg-off relative p-6 flex items-center justify-center">
        <img 
          src={booking.carId?.images?.[0] || 'https://via.placeholder.com/300x200?text=Car'} 
          alt={`${booking.carId?.make} ${booking.carId?.model}`}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-dark">
                {booking.carId?.make} {booking.carId?.model}
              </h3>
              <p className="text-sm text-muted mt-1 font-medium">Ref: <span className="text-dark font-mono">{booking.confirmationNumber}</span></p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-dark">₹{Number(booking.finalBilledAmount || booking.totalPrice).toLocaleString('en-IN')}</span>
              <span className="block text-xs text-muted font-medium mt-1">Total Paid</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-off p-4 rounded-md border border-border">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Pick-up</p>
              <p className="font-semibold text-sm text-dark">{new Date(booking.pickupDate).toLocaleDateString()}</p>
              <p className="text-xs text-muted truncate mt-0.5">{booking.pickupLocation}</p>
            </div>
            <div className="w-8 flex justify-center text-muted"><ArrowRightAltIcon className="w-6 h-6" /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Drop-off</p>
              <p className="font-semibold text-sm text-dark">{new Date(booking.dropoffDate).toLocaleDateString()}</p>
              <p className="text-xs text-muted truncate mt-0.5">{booking.dropoffLocation}</p>
            </div>
          </div>

          </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between items-center">
          {isCancellable ? (
            <button onClick={() => setShowCancelModal(true)} className="text-red-600 font-semibold text-sm hover:underline">
              Cancel Reservation
            </button>
          ) : booking.status === 'Cancelled' ? (
            <div className="flex flex-col gap-1">
              <span className="text-muted text-sm italic">This reservation was cancelled.</span>
              <a href="tel:+918792492717" className="text-accent text-sm font-medium hover:underline flex items-center gap-1">
                Contact Support <ArrowRightAltIcon className="w-4 h-4" />
              </a>
            </div>
          ) : (
             <span className="text-muted text-sm italic">
              {booking.status === 'Completed' ? 'Hope you enjoyed the ride.' : 'Currently driving.'}
            </span>
          )}
          {booking.status === 'Completed' && booking.finalBilledAmount > 0 && (
            <a className="font-semibold text-sm text-dark hover:underline flex items-center gap-1 cursor-pointer">
              Download Invoice <DownloadIcon className="w-4 h-4" />
            </a>
          )}
          {(booking.status === 'Confirmed' || booking.status === 'Upcoming') && (
            <button onClick={handleDownloadReceipt} className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1">
              <DownloadIcon className="w-3 h-3" /> Download Receipt
            </button>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-dark mb-2">Cancel Reservation?</h3>
            <p className="text-sm text-muted mb-4">Please select a reason for cancellation:</p>
            
            <div className="space-y-2 mb-6">
              {cancelReasons.map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-4 h-4 text-accent"
                  />
                  <span className="text-sm text-dark">{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowCancelModal(false)} 
                className="flex-1 py-2.5 px-4 border border-border rounded-lg text-dark font-medium hover:bg-gray-50"
              >
                Keep Booking
              </button>
              <button 
                onClick={handleCancelSubmit}
                disabled={!cancelReason || cancelling}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCard;
