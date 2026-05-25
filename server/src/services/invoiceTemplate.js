/**
 * Invoice HTML Template
 * Exact replica of modern-selfdrive-invoice (1).html
 * converted into a JS template function with dynamic data binding.
 *
 * Changes from original template:
 *  - "Extra KM" column removed from the items table
 *  - All placeholder values replaced with template variables
 *  - KM limit (300) and extra rate (₹7) hardcoded as informational text
 *  - Pickup location hardcoded as "Junagadh Office"
 */

/**
 * Format a number as Indian Rupee currency string
 * @param {number} amount
 * @returns {string} e.g. "1,500.00"
 */
const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * Format a Date object to DD / MM / YYYY
 * @param {Date|string} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd} / ${mm} / ${yyyy}`;
};

/**
 * Generate the complete 2-page invoice HTML
 * @param {Object} data - Invoice data object
 * @returns {string} Complete HTML document
 */
export const generateInvoiceHTML = (data) => {
  const {
    invoiceNumber = '—',
    invoiceDate,
    pickupDate,
    returnDate,
    customerName = '—',
    customerPhone = '—',
    customerEmail = '—',
    drivingLicenceNumber = '—',
    aadhaarNumber = '—',
    customerAddress = '—',
    vehicleName = '—',
    registrationNumber = '—',
    vehicleColor = '—',
    fuelType = '—',
    rentalDuration = 0,
    ratePerDay = 0,
    subtotal = 0,
    discount = 0,
    securityDeposit = 0,
    amountPaid = 0,
    amountDue = 0,
    totalPayable = 0,
    aadhaarFront = '',
    aadhaarBack = '',
    licenseFront = '',
    licenseBack = '',
  } = data;

  const aadhaarHTML = (aadhaarFront || aadhaarBack)
    ? `
      <div class="kyc-box" style="flex-direction: row; gap: 8px; padding: 4px; height: 110px; justify-content: center; background: #FAFAFA;">
        ${aadhaarFront ? `<img src="${aadhaarFront}" style="height: 100%; max-width: 48%; object-fit: contain; border-radius: 2px; border: 1px solid #E0E0E0;" />` : ''}
        ${aadhaarBack ? `<img src="${aadhaarBack}" style="height: 100%; max-width: 48%; object-fit: contain; border-radius: 2px; border: 1px solid #E0E0E0;" />` : ''}
      </div>
    `
    : `
      <div class="kyc-box">
        <div class="kyc-icon">&#128196;</div>
        <div class="kyc-doc-label">Aadhaar Card</div>
      </div>
    `;

  const licenseHTML = (licenseFront || licenseBack)
    ? `
      <div class="kyc-box" style="flex-direction: row; gap: 8px; padding: 4px; height: 110px; justify-content: center; background: #FAFAFA;">
        ${licenseFront ? `<img src="${licenseFront}" style="height: 100%; max-width: 48%; object-fit: contain; border-radius: 2px; border: 1px solid #E0E0E0;" />` : ''}
        ${licenseBack ? `<img src="${licenseBack}" style="height: 100%; max-width: 48%; object-fit: contain; border-radius: 2px; border: 1px solid #E0E0E0;" />` : ''}
      </div>
    `
    : `
      <div class="kyc-box">
        <div class="kyc-icon">&#128196;</div>
        <div class="kyc-doc-label">Driving Licence</div>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Modern Selfdrive – Invoice ${invoiceNumber}</title>
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Gujarati:wght@400;500&display=swap"
    rel="stylesheet" />
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      background: #E8E8E8;
      color: #1A1A1A;
      font-size: 12px;
      line-height: 1.5;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      background: #FFFFFF;
      margin: 24px auto;
      display: flex;
      flex-direction: column;
    }

    .page-body {
      flex: 1;
      padding: 36px 40px 24px;
    }

    /* ── HEADER ─────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 1.5px solid #1A1A1A;
    }

    .brand-left {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .brand-left img {
      width: 56px;
      height: 56px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .brand-text {}

    .brand-name {
      font-size: 17px;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: -0.3px;
      line-height: 1.2;
    }

    .brand-tagline {
      font-size: 9px;
      font-weight: 500;
      color: #B89B5E;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin: 3px 0 8px;
    }

    .brand-address {
      font-size: 10.5px;
      color: #555;
      line-height: 1.7;
      font-weight: 400;
    }

    .invoice-right {
      text-align: right;
    }

    .invoice-title {
      font-size: 28px;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: -1px;
      line-height: 1;
      margin-bottom: 6px;
    }

    .invoice-meta-grid {
      display: flex;
      flex-direction: column;
      gap: 3px;
      align-items: flex-end;
      margin-top: 8px;
    }

    .meta-row {
      display: flex;
      gap: 10px;
      font-size: 10.5px;
    }

    .meta-row .label {
      color: #888;
      font-weight: 400;
    }

    .meta-row .value {
      color: #1A1A1A;
      font-weight: 600;
      min-width: 100px;
      text-align: right;
    }

    /* ── BILL TO + RENTAL DETAILS ────────────── */
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-top: 22px;
      padding-bottom: 20px;
      border-bottom: 1px solid #E0E0E0;
    }

    .bill-to {}

    .section-label {
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #B89B5E;
      margin-bottom: 8px;
    }

    .customer-name {
      font-size: 14px;
      font-weight: 600;
      color: #1A1A1A;
      margin-bottom: 5px;
    }

    .customer-detail {
      font-size: 10.5px;
      color: #555;
      line-height: 1.75;
    }

    .rental-details {
      display: flex;
      gap: 28px;
    }

    .rental-col {}

    .rental-item {
      margin-bottom: 10px;
    }

    .rental-item:last-child {
      margin-bottom: 0;
    }

    .rental-item .r-label {
      font-size: 8.5px;
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 2px;
    }

    .rental-item .r-value {
      font-size: 11.5px;
      font-weight: 600;
      color: #1A1A1A;
    }

    /* ── TABLE ───────────────────────────────── */
    .table-wrap {
      margin-top: 22px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead th {
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #888;
      padding: 0 10px 8px;
      border-bottom: 1px solid #1A1A1A;
      text-align: left;
    }

    thead th:not(:first-child) {
      text-align: right;
    }

    tbody td {
      padding: 10px 10px;
      border-bottom: 1px solid #EBEBEB;
      font-size: 11.5px;
      color: #1A1A1A;
      vertical-align: top;
    }

    tbody td:not(:first-child) {
      text-align: right;
    }

    .item-name {
      font-weight: 600;
      font-size: 12px;
      margin-bottom: 2px;
    }

    .item-sub {
      font-size: 10px;
      color: #888;
      font-weight: 400;
      line-height: 1.5;
    }

    .placeholder-row td {
      padding: 10px 10px;
      border-bottom: 1px solid #EBEBEB;
      color: #CCCCCC;
      font-size: 11px;
    }

    /* ── TOTALS ──────────────────────────────── */
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-top: 0;
    }

    .totals-table {
      width: 260px;
    }

    .totals-table .t-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #F0F0F0;
      font-size: 11px;
    }

    .totals-table .t-row:last-child {
      border-bottom: none;
    }

    .totals-table .t-row .tl {
      color: #666;
    }

    .totals-table .t-row .tv {
      font-weight: 500;
      color: #1A1A1A;
    }

    .totals-table .t-row.discount .tv {
      color: #2E7D52;
    }

    .totals-table .t-row.paid .tv {
      color: #2E7D52;
    }

    .totals-table .t-row.due .tv {
      color: #C0392B;
      font-weight: 600;
    }

    .totals-table .t-row.total {
      border-top: 1.5px solid #1A1A1A;
      border-bottom: none;
      margin-top: 4px;
      padding-top: 10px;
    }

    .totals-table .t-row.total .tl {
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #1A1A1A;
    }

    .totals-table .t-row.total .tv {
      font-size: 16px;
      font-weight: 700;
      color: #1A1A1A;
    }

    /* ── NOTE ────────────────────────────────── */
    .note-section {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }

    .note-box .note-label {
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #888;
      margin-bottom: 5px;
    }

    .note-box .note-text {
      font-size: 10.5px;
      color: #555;
      line-height: 1.7;
      max-width: 320px;
    }

    .signature-box {
      text-align: center;
    }

    .sig-line {
      width: 110px;
      border-top: 1px solid #1A1A1A;
      margin: 0 auto 5px;
    }

    .sig-label {
      font-size: 9px;
      color: #888;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* ── KYC UPLOAD SECTION ──────────────────── */
    .kyc-section {
      margin-top: 28px;
      padding-top: 18px;
      border-top: 1px solid #E0E0E0;
    }

    .kyc-label {
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #B89B5E;
      margin-bottom: 12px;
    }

    .kyc-grid {
      display: flex;
      gap: 16px;
    }

    .kyc-box {
      flex: 1;
      height: 90px;
      border: 1px dashed #CCCCCC;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #FAFAFA;
    }

    .kyc-box .kyc-doc-label {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #AAAAAA;
      margin-top: 6px;
    }

    .kyc-box .kyc-icon {
      font-size: 18px;
      color: #CCCCCC;
    }

    /* ── FOOTER ──────────────────────────────── */
    .footer {
      border-top: 1.5px solid #1A1A1A;
      padding: 14px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .footer-left {
      font-size: 10.5px;
      color: #1A1A1A;
      font-weight: 600;
    }

    .footer-left span {
      font-weight: 400;
      color: #666;
      margin-left: 6px;
    }

    .footer-center {
      font-size: 10px;
      color: #888;
      text-align: center;
    }

    .footer-center .fc-label {
      font-size: 8px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #B89B5E;
      margin-bottom: 2px;
    }

    .footer-divider {
      width: 1px;
      height: 28px;
      background: #E0E0E0;
    }

    /* ════════════════════════════════
     PAGE 2 — TERMS & CONDITIONS
  ════════════════════════════════ */
    .tc-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      border-bottom: 1.5px solid #1A1A1A;
    }

    .tc-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .tc-header-left img {
      width: 44px;
      height: 44px;
      object-fit: contain;
    }

    .tc-brand-name {
      font-size: 15px;
      font-weight: 700;
      color: #1A1A1A;
    }

    .tc-brand-sub {
      font-size: 9px;
      color: #888;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }

    .tc-title-block {
      text-align: right;
    }

    .tc-title {
      font-size: 20px;
      font-weight: 700;
      color: #1A1A1A;
      letter-spacing: -0.5px;
    }

    .tc-subtitle {
      font-size: 9.5px;
      color: #888;
      letter-spacing: 1px;
      margin-top: 3px;
    }

    /* lang header */
    .lang-header {
      display: grid;
      grid-template-columns: 24px 1fr 1fr;
      gap: 0 16px;
      padding: 8px 0;
      border-bottom: 1px solid #E0E0E0;
      margin-top: 18px;
    }

    .lang-header span {
      font-size: 8.5px;
      font-weight: 600;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #B89B5E;
    }

    /* tc items */
    .tc-item {
      display: grid;
      grid-template-columns: 24px 1fr 1fr;
      gap: 0 16px;
      padding: 10px 0;
      border-bottom: 1px solid #F0F0F0;
      align-items: start;
    }

    .tc-item:last-child {
      border-bottom: none;
    }

    .tc-num {
      font-size: 10px;
      font-weight: 700;
      color: #B89B5E;
      padding-top: 1px;
    }

    .tc-gu {
      font-family: 'Noto Sans Gujarati', 'Inter', sans-serif;
      font-size: 10.5px;
      color: #444;
      line-height: 1.65;
      font-weight: 400;
    }

    .tc-en {
      font-size: 10.5px;
      color: #1A1A1A;
      line-height: 1.65;
      font-weight: 400;
    }

    .tc-footer {
      border-top: 1.5px solid #1A1A1A;
      padding: 14px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .tc-footer-left {
      font-size: 10px;
      color: #555;
    }

    .tc-footer-left strong {
      color: #1A1A1A;
    }

    .tc-footer-right {
      font-size: 10px;
      color: #888;
      font-style: italic;
    }

    @media print {
      body {
        background: #fff;
      }

      .page,
      .page-tc {
        margin: 0;
      }

      .page {
        page-break-after: always;
      }

      .no-print {
        display: none !important;
      }
    }

    /* Floating Action Bar */
    .action-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 60px;
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid rgba(184, 155, 94, 0.3);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 40px;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .action-title {
      color: #FFFFFF;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      font-family: 'Inter', sans-serif;
    }

    .action-title span {
      color: #B89B5E;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
    }

    .btn-action {
      background: #B89B5E;
      color: #1A1A1A;
      border: none;
      padding: 8px 18px;
      border-radius: 4px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      font-family: 'Inter', sans-serif;
    }

    .btn-action:hover {
      background: #cbb075;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(184, 155, 94, 0.2);
    }

    .btn-action:active {
      transform: translateY(0);
    }

    .btn-action-outline {
      background: transparent;
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .btn-action-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #FFFFFF;
      color: #FFFFFF;
      box-shadow: none;
    }

    @media screen {
      body {
        padding-top: 80px;
      }
    }
  </style>
</head>

<body>

  <!-- Floating Action Bar for Web View -->
  <div class="action-bar no-print">
    <div class="action-title">
      Modern Selfdrive &nbsp;&middot;&nbsp; <span>Invoice ${invoiceNumber}</span>
    </div>
    <div class="action-buttons">
      <button class="btn-action btn-action-outline" onclick="window.close()">Close Tab</button>
      <button class="btn-action" onclick="window.print()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right:2px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Save as PDF
      </button>
    </div>
  </div>

  <!-- ══════════════════════════════════
     PAGE 1 — INVOICE
══════════════════════════════════ -->
  <div class="page">
    <div class="page-body">

      <!-- HEADER -->
      <div class="header">
        <div class="brand-left">
          <div class="brand-text">
            <div class="brand-name">Modern Selfdrive</div>
            <div class="brand-tagline">Car Rentals &middot; Est. 2017</div>
            <div class="brand-address">
              GIDC 1, Joshipara, Junagadh &ndash; 362002, Gujarat, India<br>
              +91 90044 60634 &nbsp;&middot;&nbsp; +91 97255 50693<br>
              booking@modernselfdrive.in
            </div>
          </div>
        </div>

        <div class="invoice-right">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-meta-grid">
            <div class="meta-row"><span class="label">Invoice No.</span><span class="value">${invoiceNumber}</span></div>
            <div class="meta-row"><span class="label">Invoice Date</span><span class="value">${formatDate(invoiceDate)}</span></div>
            <div class="meta-row"><span class="label">Pickup Date</span><span class="value">${formatDate(pickupDate)}</span></div>
            <div class="meta-row"><span class="label">Return Date</span><span class="value">${formatDate(returnDate)}</span></div>
          </div>
        </div>
      </div>

      <!-- BILL TO + RENTAL DETAILS -->
      <div class="info-row">
        <div class="bill-to">
          <div class="section-label">Billed To</div>
          <div class="customer-name">${customerName}</div>
          <div class="customer-detail">
            ${customerPhone}<br>
            ${customerEmail}<br>
            DL No.: ${drivingLicenceNumber}<br>
            Aadhaar No.: ${aadhaarNumber}<br>
            ${customerAddress}
          </div>
        </div>

        <div class="rental-details">
          <div class="rental-col">
            <div class="rental-item">
              <div class="r-label">Rental Duration</div>
              <div class="r-value">${rentalDuration} Days</div>
            </div>
            <div class="rental-item">
              <div class="r-label">Pickup Location</div>
              <div class="r-value">Junagadh Office</div>
            </div>
          </div>
          <div class="rental-col">
            <div class="rental-item">
              <div class="r-label">KM Limit / Day</div>
              <div class="r-value">300 KM</div>
            </div>
            <div class="rental-item">
              <div class="r-label">Extra KM Rate</div>
              <div class="r-value">&#8377;7 per KM</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ITEMS TABLE -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="width:45%">Description</th>
              <th style="width:15%">Days</th>
              <th style="width:20%">Rate / Day</th>
              <th style="width:20%">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-name">${vehicleName}</div>
                <div class="item-sub">Reg. No.: ${registrationNumber} &nbsp;&middot;&nbsp; Color: ${vehicleColor} &nbsp;&middot;&nbsp;
                  Fuel: ${fuelType}</div>
              </td>
              <td>${rentalDuration}</td>
              <td>&#8377; ${formatCurrency(ratePerDay)}</td>
              <td>&#8377; ${formatCurrency(subtotal)}</td>
            </tr>
            <tr class="placeholder-row">
              <td>&nbsp;</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
            <tr class="placeholder-row">
              <td>&nbsp;</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- TOTALS -->
      <div class="totals-wrap">
        <div class="totals-table">
          <div class="t-row"><span class="tl">Subtotal</span><span class="tv">&#8377; ${formatCurrency(subtotal)}</span></div>
          <div class="t-row discount"><span class="tl">Discount</span><span class="tv">&minus; &#8377; ${formatCurrency(discount)}</span>
          </div>
          <div class="t-row"><span class="tl">Security Deposit</span><span class="tv">&#8377; ${formatCurrency(securityDeposit)}</span></div>
          <div class="t-row paid"><span class="tl">Amount Paid</span><span class="tv">&#8377; ${formatCurrency(amountPaid)}</span></div>
          <div class="t-row due"><span class="tl">Amount Due</span><span class="tv">&#8377; ${formatCurrency(amountDue)}</span></div>
          <div class="t-row total"><span class="tl">Total Payable</span><span class="tv">&#8377; ${formatCurrency(totalPayable)}</span></div>
        </div>
      </div>

      <!-- NOTE + SIGNATURE -->
      <div class="note-section">
        <div class="note-box">
          <div class="note-label">Note</div>
          <div class="note-text">
            All rentals are subject to Terms &amp; Conditions (see page 2).<br>
            Please record a video of the vehicle before pickup.<br>
            Max 300 KM/day; extra kilometres charged at &#8377;7/KM.<br>
            Emergency support: +91 97255 50693 &mdash; available 24/7.
          </div>
        </div>
        <div class="signature-box">
          <div style="height:36px;"></div>
          <div class="sig-line"></div>
          <div class="sig-label">Authorised Signatory</div>
        </div>
      </div>

      <!-- KYC DOCUMENTS -->
      <div class="kyc-section">
        <div class="kyc-label">Customer KYC Documents</div>
        <div class="kyc-grid">
          ${aadhaarHTML}
          ${licenseHTML}
        </div>
      </div>

    </div><!-- /page-body -->

    <!-- FOOTER -->
    <div class="footer">
      <div class="footer-left">Thank you for choosing Modern Selfdrive</div>
      <div class="footer-divider"></div>
      <div class="footer-center">
        <div class="fc-label">Questions &amp; Support</div>
        <div>booking@modernselfdrive.in &nbsp;&middot;&nbsp; +91 90044 60634</div>
      </div>
      <div class="footer-divider"></div>
      <div class="footer-center">
        <div class="fc-label">Payment Help</div>
        <div>booking@modernselfdrive.in &nbsp;&middot;&nbsp; +91 90044 60634</div>
      </div>
    </div>
  </div>


  <!-- ══════════════════════════════════
     PAGE 2 — TERMS & CONDITIONS
══════════════════════════════════ -->
  <div class="page page-tc" style="min-height:297mm;">
    <div class="page-body">

      <!-- TC HEADER -->
      <div class="tc-header">
        <div class="tc-header-left">
          <div>
            <div class="tc-brand-name">Modern Selfdrive</div>
            <div class="tc-brand-sub">Car Rentals &middot; Junagadh, Gujarat</div>
          </div>
        </div>
        <div class="tc-title-block">
          <div class="tc-title">Terms &amp; Conditions</div>
          <div class="tc-subtitle">Rental Agreement &nbsp;&middot;&nbsp; &#2349;&#2366;&#2337;&#2366;
            &#2325;&#2352;&#2366;&#2352;&#2344;&#2368; &#2358;&#2352;&#2340;&#2379;</div>
        </div>
      </div>

      <!-- COLUMN HEADERS -->
      <div class="lang-header">
        <span></span>
        <span>\u0A97\u0AC1\u0A9C\u0AB0\u0ABE\u0AA4\u0AC0</span>
        <span>English</span>
      </div>

      <!-- TERMS -->
      <div class="tc-item">
        <div class="tc-num">01</div>
        <div class="tc-gu">\u0A97\u0ACD\u0AB0\u0ABE\u0AB9\u0A95\u0AC7 \u0A86\u0AB0.\u0A9F\u0AC0.\u0A93. \u0AAE\u0ABE\u0AA8\u0ACD\u0AAF \u0AA1\u0ACD\u0AB0\u0ABE\u0A87\u0AB5\u0ABF\u0A82\u0A97 \u0AB2\u0ABE\u0A87\u0AB8\u0AA8\u0ACD\u0AB8 \u0AB0\u0ABE\u0A96\u0AB5\u0AC1\u0A82 \u0AAA\u0AA1\u0AB6\u0AC7 \u0A85\u0AA8\u0AC7 \u0AB5\u0ABE\u0AB9\u0AA8 \u0A9A\u0AB2\u0ABE\u0AB5\u0AA4\u0AC0 \u0AB5\u0A96\u0AA4\u0AC7 \u0AB9\u0A82\u0AAE\u0AC7\u0AB6\u0ABE \u0AB8\u0ABE\u0AA5\u0AC7 \u0AB0\u0ABE\u0A96\u0AB5\u0AC1\u0A82
          \u0AAA\u0AA1\u0AB6\u0AC7.</div>
        <div class="tc-en">Customer must keep a valid R.T.O. Driving License and carry it at all times while operating
          the vehicle.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">02</div>
        <div class="tc-gu">\u0AB5\u0ABE\u0AB9\u0AA8 \u0AAD\u0ABE\u0AA1\u0AC7 \u0AB2\u0A88 \u0A97\u0AAF\u0ABE \u0AB9\u0ACB\u0AAF \u0AA4\u0AC7 \u0AB8\u0AAE\u0AAF \u0AA6\u0AB0\u0AAE\u0ABF\u0AAF\u0ABE\u0AA8 \u0AA6\u0AB0\u0AC7\u0A95 \u0AAA\u0ACD\u0AB0\u0A95\u0ABE\u0AB0\u0AA8\u0ABE \u0AA6\u0A82\u0AA1, \u0AAA\u0AC7\u0AA8\u0AB2\u0ACD\u0A9F\u0AC0, \u0AA8\u0AC1\u0A95\u0AB8\u0ABE\u0AA8, \u0A9F\u0ACB\u0AB2\u0A9F\u0AC7\u0A95\u0ACD\u0AB8 \u0A97\u0ACD\u0AB0\u0ABE\u0AB9\u0A95\u0AC7
          \u0AAB\u0AB0\u0A9C\u0ABF\u0AAF\u0ABE\u0AA4 \u0AAD\u0AB0\u0AB5\u0ABE\u0AA8\u0ABE \u0AB0\u0AB9\u0AC7\u0AB6\u0AC7.</div>
        <div class="tc-en">The customer must pay all fines, penalties, damages, and toll taxes incurred during the
          rental period.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">03</div>
        <div class="tc-gu">\u0AB5\u0AC0\u0AAE\u0ABE \u0AA6\u0ACD\u0AB5\u0ABE\u0AB0\u0ABE \u0A95\u0AB5\u0AB0 \u0AA8 \u0AA5\u0AA4\u0ABE \u0AA8\u0AC1\u0A95\u0AB8\u0ABE\u0AA8\u0AA8\u0ACB \u0AB0\u0AC0\u0AAA\u0AC7\u0AB0\u0AC0\u0A82\u0A97 \u0A96\u0AB0\u0ACD\u0A9A \u0A85\u0AA8\u0AC7 \u0AB0\u0AC0\u0AAA\u0AC7\u0AB0 \u0AA6\u0AB0\u0AAE\u0ABF\u0AAF\u0ABE\u0AA8\u0AA8\u0AC1\u0A82 \u0AAD\u0ABE\u0AA1\u0AC1\u0A82 \u0A97\u0ACD\u0AB0\u0ABE\u0AB9\u0A95\u0AC7 \u0AAB\u0AB0\u0A9C\u0ABF\u0AAF\u0ABE\u0AA4
          \u0A86\u0AAA\u0AB5\u0ABE\u0AA8\u0AC1\u0A82 \u0AB0\u0AB9\u0AC7\u0AB6\u0AC7.</div>
        <div class="tc-en">The customer is responsible for any repair costs not covered by insurance, including rental
          fees during the repair period.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">04</div>
        <div class="tc-gu">\u0AAD\u0ABE\u0AA1\u0ABE \u0A95\u0AB0\u0ABE\u0AB0 \u0AA6\u0AB0\u0AAE\u0ABF\u0AAF\u0ABE\u0AA8 \u0A85\u0A95\u0AB8\u0ACD\u0AAE\u0ABE\u0AA4 \u0AA5\u0ABE\u0AAF \u0AA4\u0ACB \u0A97\u0ACD\u0AB0\u0ABE\u0AB9\u0A95\u0AC7 \u0AA4\u0ABE\u0AA4\u0ACD\u0A95\u0ABE\u0AB2\u0ABF\u0A95 \u0AB8\u0ACC \u0AAA\u0ACD\u0AB0\u0AA5\u0AAE \u0AAE\u0ACB\u0AA1\u0AB0\u0ACD\u0AA8 \u0AB8\u0AC7\u0AB2\u0ACD\u0AAB \u0AA1\u0ACD\u0AB0\u0ABE\u0A87\u0AB5\u0AA8\u0AC7 \u0A9C\u0ABE\u0AA3 \u0A95\u0AB0\u0AB5\u0ABE\u0AA8\u0AC0
          \u0AB0\u0AB9\u0AC7\u0AB6\u0AC7.</div>
        <div class="tc-en">If an accident occurs during the rental period, the customer must immediately notify Modern
          Selfdrive first.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">05</div>
        <div class="tc-gu">\u0AAD\u0ABE\u0AA1\u0ABE \u0A95\u0AB0\u0ABE\u0AB0 \u0AB5\u0AA7\u0ABE\u0AB0\u0AB5\u0ACB \u0AB9\u0ACB\u0AAF \u0AA4\u0ACB \u0A95\u0AB0\u0ABE\u0AB0 \u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0AA5\u0ABE\u0AAF \u0AA4\u0AC7 \u0AAA\u0AB9\u0AC7\u0AB2\u0ABE \u0A9C\u0ABE\u0AA3 \u0A95\u0AB0\u0AB5\u0ABE\u0AA8\u0AC0 \u0AB0\u0AB9\u0AC7\u0AB6\u0AC7.</div>
        <div class="tc-en">If the customer wishes to extend the rental, they must inform Modern Selfdrive before the
          agreement expires.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">06</div>
        <div class="tc-gu">\u0A97\u0ACD\u0AB0\u0ABE\u0AB9\u0A95\u0AC7 \u0AB5\u0ABE\u0AB9\u0AA8 \u0AB8\u0A82\u0AAD\u0ABE\u0AB3\u0AA4\u0ABE \u0AAA\u0AB9\u0AC7\u0AB2\u0ABE \u0AB5\u0ABE\u0AB9\u0AA8\u0AA8\u0ACB \u0AB5\u0ABF\u0AA1\u0ABF\u0AAF\u0ACB \u0AAB\u0AB0\u0A9C\u0ABF\u0AAF\u0ABE\u0AA4 \u0AB2\u0A88 \u0AB2\u0AC7\u0AB5\u0ABE\u0AA8\u0AC0 \u0AB5\u0ABF\u0AA8\u0A82\u0AA4\u0AC0.</div>
        <div class="tc-en">The customer is requested to record a video of the vehicle before taking possession of it.
        </div>
      </div>

      <div class="tc-item">
        <div class="tc-num">07</div>
        <div class="tc-gu">\u0AB5\u0ABE\u0AB9\u0AA8 \u0AA6\u0ABF\u0AB5\u0AB8 \u0AA6\u0AC0\u0AA0 \u0AAE\u0AC7\u0A95\u0ACD\u0AB8. \u0AE9\u0AE6\u0AE6 \u0A95\u0AC0.\u0AAE\u0AC0. \u0AAE\u0AB0\u0ACD\u0AAF\u0ABE\u0AA6\u0ABE\u0AAE\u0ABE\u0A82 \u0A9A\u0AB2\u0ABE\u0AB5\u0AB5\u0AC1\u0A82. \u0AB5\u0AA7\u0ABE\u0AB0\u0AC7 \u0A95\u0AC0.\u0AAE\u0AC0. \u0AA6\u0AC0\u0AA0 \u20B97 \u0A8F\u0A95\u0ACD\u0AB8\u0ACD\u0A9F\u0ACD\u0AB0\u0ABE \u0A9A\u0ABE\u0AB0\u0ACD\u0A9C
          \u0AB2\u0ABE\u0A97\u0AB6\u0AC7.</div>
        <div class="tc-en">Maximum 300 km per day. Additional kilometres beyond the limit will be charged at \u20B97
          per km.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">08</div>
        <div class="tc-gu">\u0AB5\u0ABE\u0AB9\u0AA8\u0AA8\u0ACB \u0A89\u0AAA\u0AAF\u0ACB\u0A97 \u0A95\u0ACB\u0A88 \u0AAA\u0AA3 \u0A97\u0AC7\u0AB0\u0A95\u0ABE\u0AA8\u0AC2\u0AA8\u0AC0 \u0AAA\u0ACD\u0AB0\u0AB5\u0AC3\u0AA4\u0ACD\u0AA4\u0ABF\u0AAE\u0ABE\u0A82 \u0A95\u0AB0\u0AC0 \u0AB6\u0A95\u0ABE\u0AB6\u0AC7 \u0AA8\u0AB9\u0AC0\u0A82. \u0A89\u0AB2\u0ACD\u0AB2\u0A82\u0A98\u0AA8 \u0AAC\u0AA6\u0AB2 \u0AAE\u0ABE\u0AA4\u0ACD\u0AB0 \u0A97\u0ACD\u0AB0\u0ABE\u0AB9\u0A95 \u0A9C\u0AB5\u0ABE\u0AAC\u0AA6\u0ABE\u0AB0
          \u0AB0\u0AB9\u0AC7\u0AB6\u0AC7.</div>
        <div class="tc-en">The vehicle must not be used for any illegal purpose or activity. The customer alone will be
          held responsible for any such violation.</div>
      </div>

      <div class="tc-item">
        <div class="tc-num">09</div>
        <div class="tc-gu">\u0AB5\u0ABE\u0AB9\u0AA8 \u0AAC\u0A82\u0AA7 \u0AAA\u0AA1\u0AC7 \u0AA4\u0ACB \u0AA4\u0ABE\u0AA4\u0ACD\u0A95\u0ABE\u0AB2\u0ABF\u0A95 \u0A87\u0AAE\u0AB0\u0A9C\u0AA8\u0ACD\u0AB8\u0AC0 \u0AB8\u0AB0\u0ACD\u0AB5\u0ABF\u0AB8 \u0A9F\u0AC0\u0AAE\u0AA8\u0ACB \u0AB8\u0A82\u0AAA\u0AB0\u0ACD\u0A95 \u0A95\u0AB0\u0AB5\u0ACB. \u0AAE\u0ACB.: +91 97255 50693</div>
        <div class="tc-en">If the vehicle breaks down, immediately contact our Emergency Support Team. Mobile:
          +919725550693</div>
      </div>

      <!-- ACKNOWLEDGEMENT -->
      <div style="margin-top:20px;padding:12px 16px;border:1px solid #E0E0E0;border-radius:2px;background:#FAFAFA;">
        <div
          style="font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:5px;">
          Customer Acknowledgement</div>
        <div style="font-size:10.5px;color:#555;line-height:1.7;">
          I have read, understood, and agree to abide by all the above Terms &amp; Conditions of Modern Selfdrive.
          I acknowledge that I am fully responsible for the vehicle during the rental period.
        </div>
        <div style="display:flex;gap:60px;margin-top:22px;">
          <div>
            <div style="width:160px;border-top:1px solid #1A1A1A;margin-bottom:5px;"></div>
            <div style="font-size:9px;color:#888;letter-spacing:1px;text-transform:uppercase;">Customer Signature</div>
          </div>
          <div>
            <div style="width:160px;border-top:1px solid #1A1A1A;margin-bottom:5px;"></div>
            <div style="font-size:9px;color:#888;letter-spacing:1px;text-transform:uppercase;">Date</div>
          </div>
        </div>
      </div>

    </div><!-- /page-body -->

    <!-- TC FOOTER -->
    <div class="tc-footer">
      <div class="tc-footer-left">
        By renting a vehicle, the customer agrees to all the above terms.<br>
        <strong>Modern Selfdrive</strong> &nbsp;&middot;&nbsp; booking@modernselfdrive.in &nbsp;&middot;&nbsp; +91 90044
        60634
      </div>
      <div class="tc-footer-right">Drive safe. Drive smart.</div>
    </div>
  </div>

</body>

</html>`;
};

export { formatCurrency, formatDate };
