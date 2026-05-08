# Modern Selfdrive Car 🚗

<div align="center">

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://github.com/Jeeerryyy/Car-Rental-Modern-)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)

**A full-stack self-drive car rental platform built for Modern Selfdrive Car, Junagadh.**

_Owner CRM portal · Public booking site · Real-time fleet management_

</div>

---

## 📋 Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Features](#features)
- [Development Log](#development-log)
- [License](#license)

---

## About

Modern Selfdrive Car is a production-grade car rental platform serving the Junagadh, Gujarat market. The platform has two sides:

1. **Public Site** — Customers can browse the fleet, view car details, explore destinations, and contact the business.
2. **Owner CRM Portal** — The fleet owner manages vehicles, monitors bookings, tracks revenue, and views client analytics through a dedicated dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **Backend** | Express 5.2, Node.js 24 |
| **Database** | MongoDB Atlas via Mongoose 9 |
| **Auth** | JWT (httpOnly cookies), bcrypt |
| **Storage** | Cloudinary (vehicle images) |
| **Payments** | Razorpay (INR) |
| **Security** | Helmet, CORS, rate limiting, mongo-sanitize, XSS protection, HPP |

---

## Project Structure

```
Modern-Drive/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── api/              # Axios instance (authenticated)
│   │   ├── components/       # Reusable UI components
│   │   │   ├── auth/         # ProtectedRoute
│   │   │   ├── layout/       # Navbar, Footer, ErrorBoundary
│   │   │   ├── owner/        # OwnerLayout, Sidebar, Topbar
│   │   │   └── ui/           # CarCard, Icons, SearchWidget
│   │   ├── context/          # AuthContext (JWT state)
│   │   ├── pages/            # Route-level page components
│   │   │   ├── owner/        # CRM pages (Dashboard, Fleet, etc.)
│   │   │   └── *.jsx         # Public pages (Home, Cars, etc.)
│   │   ├── services/         # API client, socket, sync
│   │   └── App.jsx           # Route definitions
│   └── vite.config.js
│
├── server/                   # Express backend
│   ├── config/               # env.js, cloudinary.js
│   ├── controllers/          # Request handlers
│   ├── middleware/            # auth, errorHandler, rateLimiter, upload
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Express route definitions
│   ├── services/             # Business logic layer
│   ├── utils/                # Logger, AppError, cache, socket
│   └── server.js             # Application entry point
│
└── tests/                    # Test files
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for image uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/Jeeerryyy/Car-Rental-Modern-.git
cd Car-Rental-Modern-

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Terminal 1 — Start the backend
cd server
npm start                     # Runs on http://localhost:5000

# Terminal 2 — Start the frontend
cd client
npm run dev                   # Runs on http://localhost:5173
```

### Seeding Test Data

```bash
cd server
npm run seed                  # Populates the database with sample cars
```

---

## Environment Variables

### Server (`server/.env`)

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/<db>

JWT_SECRET=<min-32-char-secret>
JWT_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=<cloud_name>
CLOUDINARY_API_KEY=<api_key>
CLOUDINARY_API_SECRET=<api_secret>

RAZORPAY_KEY_ID=<key_id>
RAZORPAY_KEY_SECRET=<key_secret>
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5000
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ✗ | Register owner or customer |
| `POST` | `/api/auth/login` | ✗ | Login (rate limited) |
| `POST` | `/api/auth/logout` | ✗ | Logout (clears cookie) |
| `GET` | `/api/auth/me` | ✓ | Get current user session |

### Cars (Public)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/cars` | ✗ | List cars with filters & pagination |
| `GET` | `/api/cars/featured` | ✗ | Featured cars for homepage |
| `GET` | `/api/cars/popular` | ✗ | Popular cars |
| `GET` | `/api/cars/:id` | ✗ | Single car details |

### Owner CRM
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/owner/stats` | Owner | Dashboard KPIs and recent bookings |
| `GET` | `/api/owner/clients` | Owner | Client list with booking metrics |

### Bookings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/bookings` | Owner | All bookings (owner view) |
| `POST` | `/api/bookings` | ✓ | Create a new booking |
| `POST` | `/api/bookings/verify-payment` | ✓ | Verify Razorpay payment |

### Other
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/newsletter/subscribe` | ✗ | Subscribe to newsletter |
| `GET` | `/api/reviews/featured` | ✗ | Featured reviews |
| `GET` | `/health` | ✗ | Server health check |

---

## Features

### Public Website
- 🏠 **Homepage** — Hero section, featured cars, destinations, reviews, how-it-works
- 🚗 **Fleet Browser** — Filter by type, fuel, transmission, price range, drive option
- 📄 **Car Detail** — Image gallery, specs, booking form
- 📞 **Contact Page** — Multi-channel contact with form
- 🗺️ **Destinations** — Curated travel routes from Junagadh

### Owner CRM Portal
- 📊 **Dashboard** — Revenue, active bookings, fleet utilization gauge
- 🚙 **Fleet Management** — Vehicle inventory with search and status
- ➕ **Add Vehicle** — Multi-field form to add cars to fleet
- 📋 **Bookings** — Filterable booking list with status badges
- 👥 **Clients** — Aggregated client metrics (total spend, booking count)
- 🔐 **Auth** — Secure sign-in with brute-force protection

### Security
- 🛡️ Helmet CSP headers
- 🔒 CORS with credential support
- ⏱️ Rate limiting (global + auth-specific)
- 🧹 Input sanitization (XSS + NoSQL injection)
- 🔑 bcrypt password hashing (12 rounds)
- 🍪 httpOnly JWT cookies

---

## Development Log

| Date | Milestone | Description |
|------|-----------|-------------|
| Apr 29 | **Project Init** | MERN project scaffolding, Express + Mongoose setup |
| Apr 29 | **Backend Core** | Models (Car, User, Booking), route structure, auth middleware |
| Apr 30 | **Frontend Base** | React + Vite setup, Navbar, Footer, Home page |
| Apr 30 | **Auth System** | JWT auth with httpOnly cookies, Owner/Customer models |
| May 01 | **Fleet Features** | Car listing, filtering, detail page, fleet management |
| May 01 | **Rebranding** | EliteDrive → Modern Selfdrive, INR localization |
| May 02 | **Admin CRM** | Owner dashboard, booking management, analytics KPIs |
| May 02 | **Security Hardening** | Helmet, CORS, rate limiting, XSS protection, mongo-sanitize |
| May 03 | **CRM Integration** | Clients page, booking list, owner stats API |
| May 08 | **Owner CRM UI** | Stitch design system integration, SignIn/SignUp pages |
| May 08 | **Bug Fixes** | Express 5 path-to-regexp compatibility, route refactoring |
| May 08 | **Full Audit** | Comprehensive project audit and status report |

---

## License

This project is proprietary software developed for **Modern Selfdrive Car, Junagadh**.

Unauthorized copying, distribution, or modification is strictly prohibited.

---

<div align="center">
  <sub>Built with ❤️ for Modern Selfdrive Car, Junagadh, Gujarat</sub>
</div>