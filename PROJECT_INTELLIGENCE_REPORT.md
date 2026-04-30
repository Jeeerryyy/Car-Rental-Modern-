# PROJECT INTELLIGENCE REPORT
**Project:** Modern Selfdrive Car — MERN Rental Platform  
**Report Date:** 2026-04-30  
**Classification:** Professional Technical Audit  
**Auditor Level:** Senior Full-Stack Engineer + Security Analyst  

---

## SECTION 1 — Executive Summary

**Modern Selfdrive Car** is a full-stack MERN (MongoDB, Express, React, Node.js) car rental platform built for the Junagadh, Gujarat (India) market. It provides self-drive car rentals, chauffeur-driven vehicles, airport pickup/drop services, and bike/scooter rentals. The platform includes a customer-facing booking experience and an administrative dashboard for fleet management, booking administration, and business analytics.

**Business Domain:** Local Transportation / Car Rental SaaS  
**Production Readiness Score:** **38/100**

**Justification:** The core CRUD and booking flows function correctly, but the application has critical security vulnerabilities (hardcoded JWT secret, no rate limiting, no input sanitization, exposed `.env` file), missing server hardening (no helmet, no graceful shutdown, no health check), inconsistent error response formats, zero test coverage, and several dead code artifacts.

### Top 3 Critical Issues
1. **`.env` file committed to repository** with a real JWT secret — immediate credential exposure risk
2. **No rate limiting** on authentication endpoints — brute force attack vector
3. **No input validation/sanitization middleware** on any server route — injection risk

### Top 3 Strengths
1. **Clean, modular architecture** — clear separation of models, routes, middleware, and frontend components
2. **Functional booking lifecycle** — complete flow from car browsing → booking → cancellation with car-status synchronization
3. **Well-designed admin dashboard** — working fleet CRUD, booking management, and analytics with real data from the API

---

## SECTION 2 — Technology Stack Manifest

| Layer | Technology | Version | Role |
|---|---|---|---|
| Runtime | Node.js | (system) | Server-side JavaScript runtime |
| Backend Framework | Express.js | ^5.2.1 | HTTP server and REST API framework |
| Database | MongoDB | (external) | NoSQL document database |
| ODM | Mongoose | ^9.6.1 | MongoDB object modeling and schema validation |
| Authentication | JSON Web Tokens (jsonwebtoken) | ^9.0.3 | Stateless auth via Bearer tokens |
| Password Hashing | bcryptjs | ^3.0.3 | Password hashing (salt factor 10) |
| HTTP Client (Server) | cookie-parser | ^1.4.7 | Cookie parsing middleware |
| CORS | cors | ^2.8.6 | Cross-Origin Resource Sharing |
| Env Management | dotenv | ^17.4.2 | Environment variable loading |
| Frontend Framework | React | ^19.2.5 | UI component library |
| Frontend Router | react-router-dom | ^7.14.2 | Client-side routing |
| HTTP Client (Frontend) | Axios | ^1.15.2 | API communication |
| State Management (Alt) | Zustand | ^5.0.12 | Lightweight state store (unused — AuthContext used instead) |
| Charting | Recharts | ^3.8.1 | Admin analytics charts |
| Icons (Unused Dep) | lucide-react | ^1.14.0 | Icon library (never imported) |
| CSS Framework | TailwindCSS | ^3.4.19 | Utility-first CSS framework |
| Build Tool | Vite | ^8.0.10 | Frontend build and dev server |
| PostCSS | postcss + autoprefixer | ^8.5.12 / ^10.5.0 | CSS processing pipeline |

---

## SECTION 3 — Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Vite + React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Home    │  │  Cars    │  │ CarDetail │  │  Auth (Login/    │ │
│  │  Page    │  │  Listing │  │  + Book   │  │  Register)       │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌────────────────────────────────────────────┐   │
│  │ Profile  │  │  Admin: Analytics | Fleet | Bookings       │   │
│  └──────────┘  └────────────────────────────────────────────┘   │
│                         │                                        │
│             ┌───────────┴───────────┐                           │
│             │  AuthContext (React)   │                           │
│             │  api.js (Axios + JWT   │                           │
│             │  Interceptor)          │                           │
│             └───────────┬───────────┘                           │
└─────────────────────────┼───────────────────────────────────────┘
                          │  HTTP (REST API)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Express.js v5)                         │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Middleware: cors, json parser, cookie-parser               │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
│  │ /api/auth │  │ /api/cars │  │/api/book  │  │ /api/admin  │  │
│  │ register  │  │ GET /     │  │ POST /    │  │ GET/POST/   │  │
│  │ login     │  │ GET /:id  │  │ GET /my   │  │ PATCH/DEL   │  │
│  │ me        │  │           │  │ PATCH /:id│  │ analytics   │  │
│  │ profile   │  │           │  │ /cancel   │  │             │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘  │
│        │              │              │               │          │
│  ┌─────┴──────────────┴──────────────┴───────────────┴──────┐  │
│  │         authMiddleware.js (protect + admin)                │  │
│  └─────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MongoDB (moderndrive)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ users       │  │ cars        │  │ bookings                │  │
│  │ (User.js)   │  │ (Car.js)    │  │ (Booking.js)            │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## SECTION 4 — File Structure Breakdown

```
/Modern-Drive
├── README.md                         ← Project documentation
├── /client                           ← Frontend React application
│   ├── index.html                    ← HTML entry with SEO meta tags, Google Fonts
│   ├── package.json                  ← Frontend dependencies
│   ├── vite.config.js                ← Vite build configuration
│   ├── tailwind.config.js            ← TailwindCSS theme extensions
│   ├── postcss.config.js             ← PostCSS plugin chain
│   ├── .env.example                  ← Client env template
│   └── /src
│       ├── main.jsx                  ← React entry point, AuthProvider wrapper
│       ├── App.jsx                   ← Route definitions, layout shell
│       ├── index.css                 ← Design tokens, Tailwind directives, animations
│       ├── /context
│       │   └── AuthContext.jsx       ← React Context for auth state (active)
│       ├── /store
│       │   └── useAuthStore.js       ← Zustand auth store (DEAD CODE — unused)
│       ├── /services
│       │   └── api.js                ← Axios instance with JWT interceptor
│       ├── /components
│       │   ├── /layout
│       │   │   ├── Navbar.jsx        ← Fixed top navigation bar
│       │   │   ├── Footer.jsx        ← Site footer with newsletter
│       │   │   ├── ProtectedRoute.jsx ← Auth guard + Admin guard
│       │   │   └── AdminSidebar.jsx  ← Admin layout with fixed sidebar
│       │   └── /ui
│       │       ├── SearchWidget.jsx  ← Homepage search form
│       │       ├── CarCard.jsx       ← Vehicle listing card
│       │       ├── FilterSidebar.jsx ← Filter panel (DEAD CODE — unused)
│       │       └── BookingCard.jsx   ← User booking display card
│       ├── /pages
│       │   ├── Home.jsx              ← Landing page with hero, fleet, destinations
│       │   ├── Cars.jsx              ← Vehicle listing with inline filters
│       │   ├── CarDetail.jsx         ← Single vehicle view + booking form
│       │   ├── Auth.jsx              ← Login / Register page
│       │   ├── Profile.jsx           ← User dashboard with booking history
│       │   └── /admin
│       │       ├── Analytics.jsx     ← KPI dashboard with charts
│       │       ├── Fleet.jsx         ← Vehicle CRUD management
│       │       └── Bookings.jsx      ← Booking status management
│       ├── /data                     ← Empty directory (unused)
│       └── /assets/images            ← Empty directory (images served from Unsplash CDN)
├── /server                           ← Backend Express application
│   ├── server.js                     ← Express entry, middleware, DB connection
│   ├── package.json                  ← Server dependencies
│   ├── seed.js                       ← Database seeding script (8 vehicles)
│   ├── .env                          ← ⚠️ COMMITTED — Contains real JWT secret
│   ├── .env.example                  ← Environment template
│   ├── /middleware
│   │   └── authMiddleware.js         ← JWT verification + admin check
│   ├── /models
│   │   ├── User.js                   ← User schema (name, email, role, KYC)
│   │   ├── Car.js                    ← Vehicle schema (make, model, pricing)
│   │   └── Booking.js                ← Booking schema (dates, status, pricing)
│   └── /routes
│       ├── auth.js                   ← Register, Login, Me, Profile routes
│       ├── cars.js                   ← Public car listing and detail routes
│       ├── bookings.js               ← Booking create, list, cancel, WhatsApp
│       └── admin.js                  ← Admin fleet CRUD, booking management, analytics
└── /resources                        ← Reference/design files (not part of app)
    ├── elitedrive-landing.html       ← Original design reference HTML
    └── /stitch_velocity_car_rental   ← Design system reference
```

---

## SECTION 5 — Data Flow Documentation

### User Registration Flow
1. User submits `{name, email, password, phone}` to frontend Auth.jsx
2. `AuthContext.register()` calls `POST /api/auth/register`
3. Server checks for duplicate email, hashes password with bcrypt (salt:10)
4. Creates User document, generates JWT (7-day expiry)
5. Returns `{token, user}` — frontend stores in localStorage
6. User redirected to `/profile`

### User Login Flow
1. User submits `{email, password}` → `POST /api/auth/login`
2. Server finds user by email, compares password hash
3. On success: JWT generated, returned with user data
4. Frontend stores token in localStorage, sets AuthContext state
5. Axios interceptor auto-attaches `Authorization: Bearer <token>` to all requests

### Booking Creation Flow
1. Authenticated user on CarDetail page selects dates, location, payment method
2. Frontend validates: pickup date not in past, dropoff > pickup
3. `POST /api/bookings` with `{carId, pickupDate, dropoffDate, pickupLocation, dropoffLocation, paymentMethod, driverRequired}`
4. Server validates car exists and is Available
5. Calculates total: `(days × pricePerDay) + (driverRequired ? days × 500 : 0)`
6. Generates 8-char hex confirmation number
7. Creates Booking document, updates Car.status to "Rented"
8. Returns booking with confirmation number
9. Frontend shows success state with booking reference

### Booking Cancellation Flow
1. User clicks "Cancel Reservation" on Profile page
2. `PATCH /api/bookings/:id/cancel` — server verifies ownership + status is "Upcoming"
3. Sets booking status to "Cancelled", releases car back to "Available"
4. Frontend refetches user's bookings

### Error Handling Pattern
- **Server:** try/catch blocks in all route handlers, `console.error` for logging
- **Client:** Axios response interceptor catches 401 → clears auth state → redirects to /auth
- **Gaps:** Error responses are inconsistent (mix of `{ error: msg }`, `'Server Error'` string, and `{ success: false, error: msg }`)

---

## SECTION 6 — API Endpoint Inventory

| Method | Route | Auth | Description | Status |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Create new user account | ✅ Working |
| POST | `/api/auth/login` | No | Authenticate and get JWT | ✅ Working |
| GET | `/api/auth/me` | Yes | Get current user profile | ✅ Working |
| PATCH | `/api/auth/profile` | Yes | Update user profile fields | ✅ Working |
| GET | `/api/cars` | No | List cars with filters | ✅ Working |
| GET | `/api/cars/:id` | No | Get single car details | ✅ Working |
| POST | `/api/bookings` | Yes | Create a new booking | ✅ Working |
| GET | `/api/bookings/my` | Yes | Get user's bookings | ✅ Working |
| GET | `/api/bookings/:id` | Yes | Get single booking | ⚠️ No ownership check |
| PATCH | `/api/bookings/:id/cancel` | Yes | Cancel an upcoming booking | ✅ Working |
| POST | `/api/bookings/whatsapp-confirm` | Yes | Simulated WhatsApp notification | ⚠️ Stub only |
| GET | `/api/admin/cars` | Admin | List all cars (admin) | ✅ Working |
| POST | `/api/admin/cars` | Admin | Add new vehicle | ⚠️ No input validation |
| PATCH | `/api/admin/cars/:id` | Admin | Update vehicle | ✅ Working |
| DELETE | `/api/admin/cars/:id` | Admin | Remove vehicle from fleet | ✅ Working |
| GET | `/api/admin/bookings` | Admin | List all bookings | ✅ Working |
| PATCH | `/api/admin/bookings/:id` | Admin | Change booking status | ⚠️ No status transition validation |
| GET | `/api/admin/analytics` | Admin | Get dashboard metrics | ✅ Working |
| GET | `/health` or `/api/health` | No | Health check | ❌ Missing |

---

## SECTION 7 — Database Schema Documentation

### User Collection
| Field | Type | Constraints | Notes |
|---|---|---|---|
| name | String | required | Full name |
| email | String | required, unique | Login identifier |
| password | String | required | bcrypt hashed |
| phone | String | optional | Indian mobile number |
| role | String | enum: user/admin, default: user | Authorization level |
| licenseNumber | String | optional | Indian DL number |
| aadhaarVerified | Boolean | default: false | KYC verification flag |
| state | String | default: Gujarat | User's state |
| membershipTier | String | enum: Silver/Gold/Platinum, default: Silver | Loyalty tier |
| timestamps | Auto | createdAt, updatedAt | Mongoose timestamps |

**Missing Indexes:** email (has unique, auto-indexed), role (no index — needed for admin user counts)

### Car Collection
| Field | Type | Constraints | Notes |
|---|---|---|---|
| make | String | required | Manufacturer |
| model | String | required | Model name |
| year | Number | required | Manufacturing year |
| category | String | required, enum: Hatchback/Sedan/SUV/Luxury/Bike/Scooter | Vehicle type |
| transmission | String | required, enum: Automatic/Manual | Gearbox type |
| seats | Number | required | Passenger capacity |
| fuelType | String | required, enum: Petrol/Diesel/CNG/Electric | Fuel type |
| driveOption | String | enum: Self Drive/With Driver/Both, default: Self Drive | Service type |
| securityDeposit | Number | default: 0 | Refundable deposit (INR) |
| pricePerDay | Number | required | Daily rental rate (INR) |
| status | String | enum: Available/Rented/Maintenance, default: Available | Current state |
| images | [String] | optional | Image URLs array |
| licensePlate | String | required, unique | Indian registration number |
| rating | Number | default: 0 | Average rating |
| features | [String] | optional | Feature tags |

**Missing Indexes:** status (frequently filtered), category, pricePerDay (range queries)

### Booking Collection
| Field | Type | Constraints | Notes |
|---|---|---|---|
| userId | ObjectId → User | required | Customer reference |
| carId | ObjectId → Car | required | Vehicle reference |
| pickupDate | Date | required | Rental start |
| dropoffDate | Date | required | Rental end |
| pickupLocation | String | required | Pick-up point |
| dropoffLocation | String | required | Drop-off point |
| totalPrice | Number | required | Calculated total (INR) |
| paymentMethod | String | enum: Card/UPI/Cash/NetBanking, default: Card | Payment type |
| gstInvoiceNumber | String | optional | GST invoice (never populated) |
| driverRequired | Boolean | default: false | Chauffeur flag |
| status | String | enum: Active/Upcoming/Completed/Cancelled, default: Upcoming | Lifecycle state |
| confirmationNumber | String | required, unique | 8-char hex reference |

**Missing Indexes:** userId (frequent user queries), status, pickupDate

---

## SECTION 8 — Security Audit Results

### CRITICAL (Must Fix Before Production)

| # | Issue | Location | Impact | Fix |
|---|---|---|---|---|
| S-1 | `.env` committed with real JWT secret | `server/.env` | Credential exposure — anyone with repo access can forge JWTs | Add to `.gitignore`, rotate secret |
| S-2 | JWT secret fallback to `'secret'` string | `auth.js:31,56`, `authMiddleware.js:17` | If env var missing, trivially guessable secret | Remove fallback, fail fast |
| S-3 | No rate limiting on auth endpoints | `server.js` | Brute force attacks on login/register | Add `express-rate-limit` |
| S-4 | No input validation middleware | All routes | NoSQL injection, XSS via user-controlled fields | Add `express-validator` |
| S-5 | No HTTP security headers | `server.js` | XSS, clickjacking, MIME sniffing attacks | Add `helmet` |

### HIGH

| # | Issue | Location | Impact | Fix |
|---|---|---|---|---|
| S-6 | bcrypt salt rounds = 10 (below recommended) | `auth.js:18` | Faster brute force of stolen hashes | Increase to 12 |
| S-7 | CORS allows only localhost:5173 (hardcoded) | `server.js:13` | Breaks in production deployment | Use env variable |
| S-8 | IDOR: Any user can view any booking | `bookings.js:74-88` | Data exposure between users | Add ownership check |
| S-9 | Admin booking status has no transition validation | `admin.js:70-103` | Can set invalid state transitions | Validate allowed transitions |
| S-10 | No password strength requirements | `auth.js:9` | Weak passwords accepted | Add min length/complexity validation |

### MEDIUM

| # | Issue | Location | Impact | Fix |
|---|---|---|---|---|
| S-11 | Error responses leak `err.message` to client | `admin.js:26` | Internal information disclosure | Use generic error messages |
| S-12 | `console.error(err.message)` as only logging | All routes | No structured logging or audit trail | Add winston/morgan |
| S-13 | No CSRF protection | `server.js` | Cross-site request forgery | Mitigated by JWT Bearer (not cookies) — LOW risk |
| S-14 | Admin car POST accepts raw `req.body` | `admin.js:21` | Mass assignment vulnerability | Whitelist allowed fields |

### LOW

| # | Issue | Location | Impact | Fix |
|---|---|---|---|---|
| S-15 | Google/Apple OAuth buttons non-functional | `Auth.jsx:94-103` | UI misrepresentation | Remove or implement |
| S-16 | Password reset link present but non-functional | `Auth.jsx:140` | Dead UX link | Remove or implement |

---

## SECTION 9 — Performance Analysis

| # | Issue | Location | Impact | Fix |
|---|---|---|---|---|
| P-1 | Analytics endpoint loads ALL bookings + ALL cars | `admin.js:108-109` | O(n) memory + CPU with growing data | Use MongoDB aggregation pipeline |
| P-2 | No database indexes on frequently queried fields | Models | Slow queries as data grows | Add indexes on status, userId, category |
| P-3 | Revenue chart uses hardcoded dummy data | `Analytics.jsx:12-17` | Analytics chart disconnected from real data | Compute from real bookings |
| P-4 | No connection pooling configuration | `server.js:28` | Default Mongoose pool may not scale | Configure `maxPoolSize` |
| P-5 | Unsorted bookings re-sorted in memory | `admin.js:122` | JS sort after DB sort is redundant | Use `.sort()` at DB level only |
| P-6 | Booking card images not lazy-loaded | `BookingCard.jsx:21` | Unnecessary initial data transfer | Add `loading="lazy"` |
| P-7 | Single JS bundle (734KB) | Build output | Slow initial page load | Add code splitting via React.lazy |

---

## SECTION 10 — Dead Code & Technical Debt Registry

| Type | File | Description | Action |
|---|---|---|---|
| Dead Code | `store/useAuthStore.js` | Complete Zustand auth store — never imported by any component | Remove |
| Dead Code | `components/ui/FilterSidebar.jsx` | Original filter component — replaced by inline filters in Cars.jsx | Remove |
| Dead Dep | `package.json` (client) | `lucide-react` — installed but never imported | Remove from dependencies |
| Empty Dir | `client/src/data/` | Empty directory, no files | Remove |
| Empty Dir | `client/src/assets/images/` | Empty directory — images served from Unsplash | Remove or add local assets |
| Hardcoded | `Analytics.jsx:118` | `avgRating = 4.9` comment says "hardcoded" | Compute from real data |
| Hardcoded | `Analytics.jsx:12-24` | Chart data completely static (dummy) | Connect to real analytics |
| Stub | `bookings.js:124-142` | WhatsApp endpoint only logs to console | Implement or remove |
| Dead Links | `Navbar.jsx:11-13` | /services, /about, /contact — routes not defined | Create pages or remove links |
| Dead Links | `Footer.jsx:40-54` | /careers, /blog, /partners, /faq, /terms, /privacy, /guidelines — no pages | Create pages or remove |

---

## SECTION 11 — Missing Features & Gaps

| Category | Missing Feature | Priority |
|---|---|---|
| Security | Rate limiting middleware | Critical |
| Security | Input validation/sanitization middleware | Critical |
| Security | HTTP security headers (Helmet) | Critical |
| Server | Health check endpoint (`GET /health`) | High |
| Server | Graceful shutdown handler (SIGTERM/SIGINT) | High |
| Server | Request logging (morgan) | High |
| Server | Environment variable validation at startup | High |
| Server | Consistent API response format | Medium |
| Database | Indexes on status, userId, category, pricePerDay | Medium |
| Testing | Zero test files — no unit/integration/e2e tests | High |
| Frontend | Error boundary component for React crashes | Medium |
| Frontend | 404 page / catch-all route | Medium |
| Frontend | Lazy loading for route-level code splitting | Medium |
| Frontend | `<img>` lazy loading attributes | Low |
| Frontend | Console.log removal for production | Low |

---

## SECTION 12 — Report Conclusion

### Final Verdict
The application has a solid foundation with clean code organization and complete business logic flows, but it is **NOT production-ready** due to critical security gaps and missing infrastructure hardening.

### Estimated Remediation Effort
- Security fixes: 2 hours
- Server hardening: 1 hour
- Dead code cleanup: 30 minutes
- Database optimization: 30 minutes
- Missing features: 1 hour
- **Total: ~5 hours**

### Remediation Priority Order
1. Security fixes (S-1 through S-5) — **Immediate**
2. Server hardening (health check, graceful shutdown, logging) — **Before deployment**
3. Database indexes — **Before production load**
4. Dead code removal — **Quality**
5. Frontend improvements — **Polish**
