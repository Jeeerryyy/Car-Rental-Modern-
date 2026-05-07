# Modern Selfdrive Car 🚗

> A full-stack car rental platform built with the MERN stack, deployed in Junagadh, Gujarat

I built this platform from scratch for a local car rental business that needed a modern, mobile-friendly booking system. What started as a simple rental website evolved into a complete platform with admin dashboards, real-time bookings, and payment processing.

## The Story Behind This Project

In 2024, a family friend who runs a car rental business in Junagadh asked if I could help them modernize their operations. They were managing bookings on WhatsApp and Excel sheets - chaos! They wanted something where customers could browse cars, check availability, and book instantly without calling repeatedly.

I spent about 3 months building this, learning a ton along the way about everything from MongoDB optimization to handling file uploads in Node.js. The best part? They're actually using it in production now, and it handles their daily bookings without issues.

## Tech Stack

**Frontend**
- React 19 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Recharts for admin analytics
- React Dropzone + Signature Pad for document handling

**Backend**
- Node.js + Express 5
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads
- PDFKit for invoice generation

**Other**
- Cloudinary for image storage (optional)
- WhatsApp API for notifications
- Google OAuth ready

## What It Does

### For Customers
- Browse available cars with filters (category, transmission, fuel type, price)
- View detailed car pages with specs, features, and pricing
- Multi-step booking flow with date selection, document upload, digital signature
- Promo code validation and discount application
- WhatsApp confirmation directly from the app
- Download booking receipts as PDF
- User dashboard to view/cancel bookings

### For Admin
- Dashboard with revenue analytics, fleet utilization, active bookings
- Full CRUD operations for fleet management
- Booking status management (Upcoming → Active → Completed)
- Promo code creation and management
- KYC document verification for users

## Key Features I Implemented

1. **Dynamic Pricing** - Hourly rates for short rentals, daily rates for longer periods, with optional driver charges
2. **Availability Checking** - Prevents double bookings by checking date overlaps before confirmation
3. **KYC System** - Document upload for compliance (Aadhaar, driving license)
4. **Digital Signatures** - Customers sign rental agreements digitally in-browser
5. **Admin Analytics** - MongoDB aggregations for real-time business insights
6. **Security** - Rate limiting, JWT validation, input sanitization, helmet headers

## Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/modern-selfdrive.git
cd modern-selfdrive

# Backend setup
cd server
npm install
# Create .env with MONGO_URI, JWT_SECRET, etc.
node seed.js    # Populate sample fleet data
npm start       # Runs on port 5000

# Frontend setup (new terminal)
cd client
npm install
npm run dev     # Runs on localhost:5173
```

## Project Structure

```
├── server/
│   ├── routes/        # API endpoints (auth, cars, bookings, admin, etc.)
│   ├── models/        # MongoDB schemas (Car, User, Booking, Promo, Review)
│   ├── middleware/    # Auth, validation, pagination, file upload
│   ├── services/      # Invoice generation, notifications
│   └── server.js      # Entry point with Express setup
│
└── client/
    ├── src/ 
    │   ├── pages/     # Home, Cars, CarDetail, Profile, Auth, etc.
    │   ├── components/# Reusable UI (CarCard, BookingCard, Navbar, etc.)
    │   ├── context/   # Auth context for state management
    │   └── services/  # API client with axios interceptors
    └── App.jsx        # Main app with routing
```

## Challenges I Solved

**The double-booking problem** - Initially I just checked if a car was "Available". But two people could book the same dates simultaneously. Fixed by adding MongoDB queries that check date overlaps on booking creation.

**PDF invoices** - Admin needed to generate proper invoices. Used PDFKit to create formatted invoices with all booking details, pricing breakdown, and business info.

**File uploads** - Started with local storage, then switched to Cloudinary for production. Used Multer with a storage adapter pattern so the code works with either.

## What I'd Do Different

If I were rebuilding this today, I'd:
- Use TypeScript throughout (especially on the backend)
- Add WebSocket for real-time admin notifications
- Implement proper payment gateway (Razorpay/PayU)
- Add unit tests with Jest/Supertest

## License

ISC - feel free to use this for learning or as a starting point for your own projects.

---

Built with ☕ and patience by Kushal Parakh 