export const getInvoiceHtml = (booking) => {
  const car = booking.car || {};
  const customer = booking.customer || {};
  
  const invoiceDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  
  const pickupDate = new Date(booking.startDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const dropoffDate = new Date(booking.endDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalDays = booking.totalDays || Math.ceil((new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)) || 1;
  const ratePerDay = car.pricePerDay || 0;
  const subtotal = ratePerDay * totalDays;
  const discount = booking.discountAmount || 0;
  const grandTotal = booking.totalPrice || (subtotal - discount);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
    }

    body {
        background: white;
        width: 800px;
        margin: 0;
        padding: 0;
    }

    .invoice-container {
        width: 100%;
        background: #f0f0f0;
    }

    .page {
        width: 800px;
        height: 1120px; /* Fixed A4 height */
        background: #fff;
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .page-content {
        flex: 1;
        position: relative;
    }

    .top-bar {
        height: 6px;
        background: #141433;
    }

    .header {
        display: flex;
        justify-content: space-between;
        padding: 40px 50px;
        align-items: center;
        background: #fff;
    }

    .logo-section {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .logo {
        width: 140px;
        height: auto;
    }

    .company-info {
        border-left: 2px solid #d7c17c;
        padding-left: 20px;
    }

    .company-info h1 {
        font-size: 34px;
        letter-spacing: 2px;
        color: #141433;
        line-height: 0.9;
        font-weight: 900;
        margin-bottom: 5px;
    }

    .company-info h3 {
        color: #c5a84b;
        font-size: 11px;
        letter-spacing: 3px;
        font-weight: bold;
        text-transform: uppercase;
    }

    .company-info p {
        margin-top: 10px;
        color: #666;
        font-size: 10px;
        line-height: 1.5;
    }

    .invoice-header-info {
        text-align: right;
    }

    .invoice-label {
        color: #a28a3c;
        font-size: 11px;
        letter-spacing: 2px;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .invoice-value {
        font-size: 20px;
        font-weight: 900;
        color: #141433;
        margin-bottom: 15px;
    }

    .booking-badge {
        background: #141433;
        color: #d7c17c;
        padding: 8px 20px;
        font-size: 18px;
        font-weight: 900;
        border-radius: 6px;
        display: inline-block;
    }

    .section-title {
        background: #f9f9f9;
        padding: 10px 50px;
        font-size: 10px;
        font-weight: 900;
        color: #a28a3c;
        letter-spacing: 4px;
        text-transform: uppercase;
        border-top: 1px solid #eee;
        border-bottom: 1px solid #eee;
    }

    .details-grid {
        display: flex;
        padding: 0;
        border-bottom: 2px solid #141433;
    }

    .detail-card {
        flex: 1;
        padding: 30px 50px;
        border-right: 1px solid #eee;
    }

    .detail-card:last-child {
        border-right: none;
    }

    .card-label {
        font-size: 9px;
        color: #999;
        letter-spacing: 1px;
        margin-bottom: 8px;
        text-transform: uppercase;
        font-weight: bold;
    }

    .card-value {
        font-size: 16px;
        font-weight: 900;
        color: #141433;
        margin-bottom: 5px;
    }

    .card-sub {
        font-size: 12px;
        color: #666;
    }

    .plate-box {
        display: inline-block;
        margin-top: 10px;
        padding: 4px 12px;
        border: 1.5px solid #141433;
        border-radius: 4px;
        font-weight: 900;
        background: #fff;
        font-size: 12px;
        color: #141433;
    }

    .table-container {
        padding: 40px 50px;
    }

    .table-head {
        display: flex;
        border-bottom: 2px solid #141433;
        padding-bottom: 10px;
        margin-bottom: 20px;
    }

    .table-head div {
        font-size: 11px;
        font-weight: 900;
        color: #a28a3c;
        letter-spacing: 2px;
    }

    .col-desc { flex: 3; }
    .col-qty { flex: 1; text-align: center; }
    .col-rate { flex: 1; text-align: right; }
    .col-total { flex: 1; text-align: right; }

    .table-row {
        display: flex;
        align-items: center;
        padding: 10px 0;
    }

    .row-title {
        font-size: 18px;
        font-weight: 900;
        color: #141433;
        margin-bottom: 5px;
    }

    .row-sub {
        font-size: 12px;
        color: #888;
    }

    .row-val {
        font-size: 16px;
        font-weight: bold;
        color: #141433;
    }

    .summary-box {
        margin: 40px 50px;
        padding: 30px;
        background: #fcfcfc;
        border-radius: 15px;
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
    }

    .payment-status {
        color: #27ae60;
        font-weight: 900;
        font-size: 12px;
        letter-spacing: 2px;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .summary-details {
        width: 300px;
    }

    .summary-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        color: #666;
    }

    .total-line {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 2px solid #141433;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .total-label {
        font-size: 18px;
        font-weight: 900;
        color: #141433;
    }

    .total-amount {
        font-size: 32px;
        font-weight: 900;
        color: #141433;
    }

    .terms-page-header {
        padding: 40px 50px;
        border-bottom: 1px solid #eee;
    }

    .terms-container {
        padding: 20px 50px;
    }

    .terms-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .term-row {
        padding-bottom: 8px;
        border-bottom: 1px solid #f5f5f5;
    }

    .term-guj {
        font-size: 12px;
        font-weight: bold;
        color: #141433;
        display: block;
        margin-bottom: 3px;
        line-height: 1.4;
    }

    .term-eng {
        font-size: 10px;
        color: #777;
        font-style: italic;
        display: block;
        line-height: 1.3;
    }

    .signature-section {
        margin-top: auto;
        padding: 20px 50px 40px 50px;
        display: flex;
        justify-content: space-between;
        gap: 40px;
    }

    .sig-box {
        flex: 1;
        text-align: center;
        position: relative;
    }

    .sig-box-inner {
        height: 80px;
        border: 1px solid #141433;
        border-radius: 8px;
        margin-bottom: 10px;
        background: #fcfcfc;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #eee;
        font-size: 32px;
        font-weight: 900;
        letter-spacing: 4px;
        opacity: 0.3;
        pointer-events: none;
    }

    .sig-label {
        font-size: 12px;
        font-weight: 900;
        color: #a28a3c;
        letter-spacing: 2px;
        text-transform: uppercase;
    }

    .footer {
        background: #141433;
        padding: 20px 50px;
        display: flex;
        justify-content: space-between;
        color: #d7c17c;
        font-size: 11px;
        font-weight: bold;
    }
</style>
</head>
<body>
<div class="invoice-container" id="invoice-render-target">
    <!-- PAGE 1: INVOICE DETAILS -->
    <div class="page" id="page-1">
        <div class="top-bar"></div>
        <div class="page-content">
            <div class="header">
                <div class="logo-section">
                    <img class="logo" src="${window.location.origin}/logo.png" alt="Logo">
                    <div class="company-info">
                        <h1>MODERN</h1>
                        <h3>SELF DRIVE RENTALS</h3>
                        <p>
                            SILVERCOIN SOCIETY, BEHIND MADINA MASJID<br>
                            JOSHIPURA, JUNAGADH – 362001
                        </p>
                    </div>
                </div>
                <div class="invoice-header-info">
                    <div class="invoice-label">TAX INVOICE</div>
                    <div class="invoice-value">${invoiceDate}</div>
                    <div class="booking-badge"># ${booking._id?.slice(-6).toUpperCase()}</div>
                </div>
            </div>

            <div class="section-title">Customer & Trip Details</div>
            <div class="details-grid">
                <div class="detail-card">
                    <div class="card-label">Renter Information</div>
                    <div class="card-value">${customer.name || 'Customer'}</div>
                    <div class="card-sub">${booking.phone || customer.phone || '-'}</div>
                    <div class="card-sub">${customer.email || ''}</div>
                </div>
                <div class="detail-card">
                    <div class="card-label">Vehicle Information</div>
                    <div class="card-value">${car.make} ${car.model}</div>
                    <div class="card-sub">${car.year} | ${car.fuelType || 'Petrol'}</div>
                    <div class="plate-box">${car.registrationNumber || 'GJ-11-XX-0000'}</div>
                </div>
                <div class="detail-card">
                    <div class="card-label">Rental Duration</div>
                    <div class="card-value">${totalDays} Day(s)</div>
                    <div class="card-sub">From: ${pickupDate}</div>
                    <div class="card-sub">To: ${dropoffDate}</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-head">
                    <div class="col-desc">DESCRIPTION OF SERVICES</div>
                    <div class="col-qty">DAYS</div>
                    <div class="col-rate">RATE</div>
                    <div class="col-total">TOTAL</div>
                </div>
                <div class="table-row">
                    <div class="col-desc">
                        <div class="row-title">Self Drive Car Rental</div>
                        <div class="row-sub">${car.make} ${car.model} - ${car.registrationNumber}</div>
                    </div>
                    <div class="col-qty row-val">${totalDays}</div>
                    <div class="col-rate row-val">₹ ${ratePerDay.toLocaleString('en-IN')}</div>
                    <div class="col-total row-val" style="font-size: 20px;">₹ ${subtotal.toLocaleString('en-IN')}</div>
                </div>
            </div>

            <div class="summary-box">
                <div class="payment-status">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <path d="M20 6L9 17l-5-5"/>
                    </svg>
                    PAYMENT COMPLETED
                </div>
                <div class="summary-details">
                    <div class="summary-line">
                        <span>Rental Charges</span>
                        <strong>₹ ${subtotal.toLocaleString('en-IN')}</strong>
                    </div>
                    <div class="summary-line">
                        <span>Discount / Coupon</span>
                        <strong style="color: #b33939;">- ₹ ${discount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div class="total-line">
                        <div class="total-label">TOTAL PAID</div>
                        <div class="total-amount">₹ ${grandTotal.toLocaleString('en-IN')}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="footer-item">Tel: 87924 92717</div>
            <div class="footer-item">Web: modernselfdrive.in</div>
            <div class="footer-item">support@modernselfdrive.in</div>
        </div>
    </div>

    <!-- PAGE 2: TERMS & CONDITIONS -->
    <div class="page" id="page-2">
        <div class="top-bar"></div>
        <div class="page-content">
            <div class="terms-page-header">
                <div class="logo-section">
                    <img class="logo" src="${window.location.origin}/logo.png" alt="Logo" style="width: 100px;">
                    <div class="company-info" style="padding-left: 15px;">
                        <h1 style="font-size: 24px;">MODERN</h1>
                        <h3 style="font-size: 9px;">SELF DRIVE RENTALS</h3>
                    </div>
                </div>
            </div>
            
            <div class="section-title">Rental Terms & Conditions</div>
            
            <div class="terms-container">
                <div class="terms-list">
                    <div class="term-row">
                        <span class="term-guj">૧. ગ્રાહકે આર.ટી.ઓ. માન્ય ડ્રાઈવિંગ લાઈસન્સ રાખવું પડશે અને વાહન ચલાવતી વખતે તેને હંમેશા સાથે રાખવું પડશે.</span>
                        <span class="term-eng">Customer Has to Keep a Valid R.T.O. Driving Licence & Carry It at All Times While Operating The Vehicle.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૨. વાહન ભાડે લઈ ગયા હોય તે સમય દરમ્યાન ગ્રાહકે પોતે દરકે પ્રકારનાં દંડ, પેનલ્ટી, નુકસાન, ટોલટેશ ફરજીયાત ગ્રાહકે ભરવાના રહેશે.</span>
                        <span class="term-eng">The Customer Has to Pay Any Type of Fine, Penalties, Damage, Toll Tax, ETC... incurred During The Rental Period.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૩. વાહન વિમા હેઠળ હોય છતાં પણ જે નુકસાન વિમા દ્વારા કવર થતું ન હોય તે રીપેરીંગ ખર્ચ ગ્રાહકે ફરજીયાત આપવાનો રહેશે તેમજ રીપેરીંગમાં લાગતા સમયનું ભાડુ ફરજીયાત ગ્રાહકે પોતે ચુકવવાનું રહેશે.</span>
                        <span class="term-eng">Even if the vehicle is under insurance, the customer will be responsible for the repair costs for any damage not covered by the insurance, & the customer will be responsible for the time spent on repairs.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૪. ભાડા કરાર દરમ્યાન જો વાહન નો અકસ્માત થાય તો ગ્રાહકે તાત્કાલીક સૌ પ્રથમ મોર્ડન સેલ્ફ ડ્રાઈવ ને જાણ કરવાની રહેશે.</span>
                        <span class="term-eng">If an accident occurs to the vehicle during the rental agreement, the customer must immediately notify modern self drive Car.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૫. જો ગ્રાહક પોતાનો ભાડા કરાર વધારવા માંગાતા હોય તો ભાડા કરાર પુરૂ થાય તે પહેલા જાણ કરવાની રહેશે.</span>
                        <span class="term-eng">If the customer wants to extend their rental agreement, they must inform the modern self drive before the rental agreement expires.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૬. ગ્રાહકે વાહન સંભાળતા પહેલા વાહનનો વિડિયો ફરજીયાત લઈ લેવા વિનંતી.</span>
                        <span class="term-eng">The customer is requested to take a video of the vehicle before Picking up the vehicle.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૭. વાહન દિવસ એક માં વધુમા વધુ ૩૦૦ કીલોમીટર ચલાવવાનું રહેશે. જો તેનાથી વધારે કી.મી. ચલાવવામાં આવે તો એકસ્ટ્રા કી.મી. ૭ રૂપીયા લેખે ગ્રાહક ને ચુકવવાના રહેશે.</span>
                        <span class="term-eng">The vehicle will have to travel a maximum of 300 kilometers in a day. If more than that km. Extra km Driven. The Customer Has to Pay Rs. 7 Per K.M.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૮. વાહનનો ઉપયોગ કોઈ પણ પ્રકારના ગેરકાયદેસર હેતુ અથવા ગેરકાનુની પ્રવૃતિમાં ઉપયોગ કરી શકાશે નહી, જો ઉપયોગ કરવામાં આવશે તો તેનો જવાબદાર માત્ર ને માત્ર ગ્રાહક થશે.</span>
                        <span class="term-eng">The vehicle Cannot be used for any illegal Purpose or illegal Activity, if it is used, then only the customer will be Responsible for it.</span>
                    </div>
                    <div class="term-row">
                        <span class="term-guj">૯. કોઈ પણ સંજોગો વસાત વાહન બંધ પડે તો તાત્કાલીક અમારી ઈમરજન્સી સર્પોટ ટીમનો સંપર્ક કરવો. મો.: ૯૭૨૫૫ ૫૦૬૯૩</span>
                        <span class="term-eng">If your vehicle breaks down under any circumstances, please contact our emergency support team immediately. Mo.: 9725550693</span>
                    </div>
                </div>
            </div>

            <div class="signature-section">
                <div class="sig-box">
                    <div class="sig-box-inner">SIGN HERE</div>
                    <div class="sig-label">Customer Signature</div>
                </div>
                <div class="sig-box">
                    <div class="sig-box-inner">MODERN SELF DRIVE</div>
                    <div class="sig-label">Authorized Signatory</div>
                </div>
            </div>
        </div>
        <div class="footer">
            <div class="footer-item">modern self drive - Rental Agreement</div>
            <div class="footer-item">Booking ID: #${booking._id?.slice(-6).toUpperCase()}</div>
        </div>
    </div>
</div>
</body>
</html>
`;
};
