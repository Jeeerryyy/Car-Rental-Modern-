# Modern Selfdrive - Full Backend Engineering Audit & Architecture Documentation

This document serves as the enterprise-grade technical documentation for the Modern Selfdrive backend platform. It covers not just structural overview, but detailed runtime tracing, business logic mapping, and operational architecture.

---

## 1. System & Deployment Architecture

### Tech Stack
*   **Runtime Framework:** Node.js 20.x + Express.js (ES Modules, `type: "module"`)
*   **Database:** MongoDB (via Mongoose 8.x)
*   **Caching & Queue:** Redis (via `ioredis` & BullMQ), local memory cache (`node-cache`)
*   **Real-time:** Socket.io (WebSocket)
*   **Integrations:** Razorpay (Payments), Cloudinary (File Storage), Nodemailer (SMTP), Google Sheets API.
*   **Observability:** Prometheus (`prom-client`), Sentry (`@sentry/node`), Winston.

### Operational Deployment Architecture
*   **API Server Hosting:** Deployed as a Node.js Web Service on **Render**. Scales horizontally based on CPU utilization.
*   **Database Hosting:** **MongoDB Atlas** (Dedicated/Serverless tier). Network access restricted via IP whitelisting to Render servers.
*   **Redis Hosting:** Managed Redis instance (Upstash / Render Redis) handling both L2 Cache and BullMQ message queues.
*   **Worker Deployment:** Background jobs (BullMQ workers) execute concurrently on the main Render web instance to save costs but can be split into a separate "Render Background Worker" service at scale.
*   **CI/CD:** Automated deployment triggers connected to the `master` branch on GitHub.
*   **Environments:** 
    *   `production`: Full caching, strict rate limits, production keys, secure cookies.
    *   `development`: Local testing, verbose Morgan logging, mocked webhooks.

---

## 2. Environment Variables Overview

Secrets are securely injected via Render dashboard in production and via `.env` locally.

```env
# Server Configuration
NODE_ENV=production
PORT=5000
DISABLE_RATE_LIMIT=false

# Database & Caching
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
REDIS_URL=rediss://default:<password>@<host>:<port>

# JWT Authentication (Separated secrets for scope isolation)
JWT_SECRET=owner-staff-jwt-secret-key
JWT_EXPIRY=7d
CUSTOMER_JWT_SECRET=customer-jwt-secret-key
CUSTOMER_JWT_EXPIRES_IN=30d

# Integrations
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret

RAZORPAY_KEY_ID=key_id
RAZORPAY_SECRET=secret
RAZORPAY_WEBHOOK_SECRET=webhook_secret

# URLs (For CORS and Email Links)
CLIENT_URL=https://modernselfdrive.in
PORTAL_URL=https://admin.modernselfdrive.in
```

---

## 3. Core Database Relationships

Understanding how the Mongoose collections interact:

*   **`Booking` → `Car` & `Customer`**:
    *   References `Car._id` and `Customer._id`.
    *   Contains embedded denormalized data (e.g., historical `totalPrice`, `promoCode`) to prevent historical invoice corruption if a Car's base price changes later.
*   **`Review` → `Booking` & `Car` & `Customer`**:
    *   References all three. Enforces a rule where a customer can only review a car if a valid, completed `Booking._id` exists.
*   **`Owner` (Staff) → `Owner` (Parent)**:
    *   RBAC relationship. Staff accounts have a `parentOwner` field referencing the super-admin Owner ID.
*   **`FailedJob` & `AuditLog`**:
    *   Polymorphic relations (`entityId`, `entityType`) tracing back to specific bookings, cars, or users for accountability.

---

## 4. Full Request Lifecycle Trace Documentation

How actual data flows through the backend during core operations.

### A. Booking Creation Lifecycle
```md
Frontend Request (POST /api/v1/public/booking)
↓
Express Route (public/booking.routes.js)
↓
Validation Middleware (validate(createBookingSchema))
↓
Auth Middleware (customerAuth / role verification)
↓
Idempotency Middleware (Check Redis for duplicate 'x-idempotency-key')
↓
Controller (createOrder in booking.controller.js)
↓
Service Layer (createRazorpayOrder & Booking.create)
  - Verify Promo Code validity
  - Verify Car availability (No overlapping dates via MongoDB Query)
  - Calculate base price, discount, and advance payment (₹500 standard)
↓
External Call (Razorpay API - Generate Order ID)
↓
Database Write (Booking created in PENDING state)
↓
HTTP Response (Returns Order ID & amounts to Frontend)
```

### B. Payment Verification Lifecycle
```md
Frontend Razorpay Success Callback (POST /api/v1/public/booking/verify-payment)
↓
Controller (verify in booking.controller.js)
↓
Service Layer (verifyPayment in booking.service.js)
↓
Crypto Verification (Hash Razorpay secret with order/payment ID)
↓
Database Update (Update Booking paymentStatus to PAID, status to CONFIRMED)
↓
Cache Update (invalidateBookingCache() clears Booking & Dashboard Stats cache)
↓
Queue Dispatch (Add 'sendConfirmationEmail' & 'syncGoogleSheet' to BullMQ)
↓
Socket Event (io.to('owner:id').emit('booking:created'))
↓
HTTP Response (200 OK)
```

### C. Document Upload Flow
```md
Frontend File FormData (POST /api/v1/public/upload)
↓
Auth Middleware
↓
Multer Middleware (upload.single('file'), restricts size/type in RAM)
↓
Controller (uploadCustomerDocument)
↓
Service Layer (cloudinary.uploader.upload_stream)
↓
External Call (Stream buffer to Cloudinary API)
↓
Database Update (Save secure_url to Customer profile)
↓
HTTP Response (Returns URL)
```

---

## 5. File References for Major Domains

Enterprise tracing mapping for developers:

**Booking Domain**
*   **Route:** `server/src/routes/public/booking.routes.js`, `server/src/routes/owner/booking.routes.js`
*   **Controller:** `server/src/controllers/booking.controller.js`
*   **Service:** `server/src/services/booking.service.js`
*   **Model:** `server/src/models/Booking.js`

**Authentication Domain**
*   **Route:** `server/src/routes/public/auth.routes.js`, `server/src/routes/owner/auth.routes.js`
*   **Controller:** `server/src/controllers/customer.auth.controller.js`, `server/src/controllers/owner.auth.controller.js`
*   **Service:** `server/src/services/customer.auth.service.js`, `server/src/services/owner.auth.service.js`
*   **Middleware:** `server/src/middleware/auth.js`

---

## 6. Authentication & Security Architecture

### User Login Flow (JWT)
1. User submits credentials (`POST /auth/login`).
2. Express validation catches bad formats (e.g., invalid email).
3. Controller routes to `loginCustomer` service.
4. Service fetches customer from MongoDB.
5. Password compared using `bcrypt.compare`.
6. `jsonwebtoken` generates a JWT payload with `_id`, `role`, signed with `CUSTOMER_JWT_SECRET`.
7. Token is returned in payload AND set as an `httpOnly`, `Secure`, `SameSite=none` cookie.
8. Frontend stores auth state in Zustand/React Context.

### Security Audit Defenses
*   **CORS Policy:** Strict whitelisting. Rejects unknown origins. `credentials: true` enables cookie passing.
*   **CSRF Handling:** Handled implicitly via SameSite cookie policies and custom headers.
*   **Cookie Security:** Tokens stored in `httpOnly` cookies prevent XSS theft.
*   **Upload Restrictions:** Multer limits file sizes to 5MB, strictly enforces `image/jpeg`, `image/png`, `application/pdf` mimetypes.
*   **Webhook Security:** Razorpay webhooks validate the `x-razorpay-signature` hash against `RAZORPAY_WEBHOOK_SECRET` before processing.
*   **Password Hashing:** Standard `bcrypt` with salt rounds.

---

## 7. Business Logic & Core Platform Rules

The "Brain" of the application residing in the `services/` layer:

*   **Booking Overlap Prevention:** A car cannot be booked if `startDate` falls between an existing booking's dates, OR if `endDate` falls between them, OR if the new dates completely envelop an existing booking. (`$or` conditions in Mongoose).
*   **Minimum Payment Threshold:** If a car's total rent for the trip is under ₹500, the system charges the exact total rent instead of the fixed ₹500 advance.
*   **Unpaid Booking Expiration:** Bookings created but left unpaid in Razorpay are filtered out of owner dashboards to reduce noise, and a cron job drops them after 30 minutes.
*   **Cancellation Rules:** Customers can cancel pending bookings. Confirmed bookings require Owner intervention or carry cancellation penalties (handled operationally).
*   **Manual Booking Overrides:** Owners can create manual bookings (`createManualBooking`), bypassing Razorpay entirely, instantly marking them as Confirmed/Paid in Cash.

---

## 8. Button → Backend Routing (Runtime Behavior)

Exhaustive mapping of what happens when a user clicks a button:

### Frontend (Customer App)
*   **Search / Filter Bar (Homepage)** → `GET /api/v1/public/car` (Queries Redis first, then DB).
*   **View Car Details** → `GET /api/v1/public/car/:id` (Cached).
*   **Book Now (Checkout)** → `POST /api/v1/public/booking` (Generates Razorpay Order).
*   **Payment Success Modal** → `POST /api/v1/public/booking/verify-payment`.
*   **Submit Review Button** → `POST /api/v1/public/review` (Validates if booking exists).
*   **Upload Aadhaar/License** → `POST /api/v1/public/upload` (Streams to Cloudinary).

### Portal (Owner Dashboard)
*   **Load Dashboard (Stats)** → `GET /api/v1/owner/report/stats` (Aggregates Revenue, Utilization, Active Bookings).
*   **Approve/Reject Booking Button** → `PUT /api/v1/owner/booking/:id/status` (Changes to COMPLETED/CANCELLED).
*   **Add Manual Booking Modal** → `POST /api/v1/owner/booking/manual` (Direct DB insertion).
*   **Toggle Car Maintenance Toggle** → `PATCH /api/v1/owner/car/:id/status` (Updates status to MAINTENANCE).
*   **Add New Fleet Modal** → `POST /api/v1/owner/car` (Creates Car, flushes fleet cache).
*   **Analytics Date Filter** → `GET /api/v1/owner/report/stats?startDate=X&endDate=Y` (Re-runs Aggregation Pipelines).

---

## 9. WebSocket (Socket.io) Architecture

Real-time communication used strictly for Admin Dashboard live updates.

*   **Rooms / Namespaces:** 
    *   `user:{id}`: Personal room for customer-specific alerts.
    *   `owner:{id}`: Staff and Admins join the root owner's room.
    *   `public`: Broadcasts (rarely used).
*   **Events Emitted by Server:**
    *   `booking:created`: Triggers notification bell in Admin portal when a customer completes a payment.
    *   `booking:status_updated`: Pushes live status changes to customers if an admin approves their booking.
    *   `car:availability_changed`: Alerts users looking at a car if it was just booked.
*   **Security:** Sockets are authenticated via JWT in the handshake headers/cookies before connection is established.

---

## 10. Performance & Caching Strategy

Production environments require aggressive caching for scale:

*   **Keys & TTLs:**
    *   `cars:active` (TTL 3600s) - Entire active fleet for the homepage.
    *   `dashboard:stats:ownerId` (TTL 300s) - Expensive financial aggregations.
*   **Invalidation Strategy:**
    *   Event-driven invalidation. `createBooking`, `updateBookingStatus`, or `deleteBooking` in `booking.service.js` immediately calls `invalidateBookingCache()`.
    *   `updateCar` calls `cacheService.del('cars:active')`.
*   **Database Indexing:**
    *   Compound indexes on `Booking` (`status`, `car`, `startDate`, `endDate`).
    *   Indexes on `Car` (`status`, `category`).
*   **Aggregation Optimization:** Dashboard stats filter by `paymentStatus: 'PAID'` natively in MongoDB before performing `$group` sums to save memory.

---

## 11. Background Jobs & Failure Recovery (BullMQ)

Heavy operations are processed asynchronously via BullMQ on Redis.

*   **Queues:**
    *   `emailQueue`: Sends OTPs, Invoices, Confirmations.
    *   `sheetSyncQueue`: Pushes leads to Google Sheets.
*   **Retry Strategy:** Jobs use exponential backoff. Example: `attempts: 3, backoff: { type: 'exponential', delay: 2000 }`.
*   **Dead Letter / Failed Jobs:** If a job fails 3 times, BullMQ throws a `failed` event. The server catches this and writes an entry to the `FailedJob` MongoDB collection for admin review and manual requeuing.
*   **Cron Jobs:** `node-cron` runs a cleanup script every hour (`0 * * * *`) to delete pending bookings older than 60 minutes.

---

## 12. Standard Error & API Response Formats

The backend enforces a strict, predictable JSON structure for all responses via `ApiResponse.js` and `errorHandler.js`.

### Success Response Example
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Booking retrieved successfully",
  "data": {
    "booking": {
      "_id": "60d5ec...",
      "status": "CONFIRMED"
    }
  }
}
```

### Validation Error Example (400 Bad Request)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "startDate",
      "message": "Start date must be in the future"
    }
  ]
}
```

### Business Logic Error Example (400 Bad Request)
```json
{
  "success": false,
  "message": "Car is already booked for these dates."
}
```

### Server Error Example (500 Internal Server Error)
*(Note: Stack traces are omitted in `NODE_ENV=production`)*
```json
{
  "success": false,
  "message": "Internal server error"
}
```
