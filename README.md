# Modern Selfdrive

A full-stack car rental platform built for **Modern Selfdrive**, a self-drive car rental service based in Junagadh, Gujarat, India. The platform handles everything from customer browsing and bookings to owner fleet management and payment processing — all in one unified system.

---

## What It Does

Customers can browse available vehicles, check real-time availability, apply promo codes, and complete bookings with secure online payments. The owner gets a dedicated dashboard to manage the entire fleet, track bookings, handle customer documents, generate invoices, and view revenue analytics — all from a single admin panel.

---

## Tech

**Backend** — Node.js · Express · MongoDB · Redis · Socket.io · Razorpay · Cloudinary · Nodemailer

**Customer App** — React 19 · Vite · Tailwind CSS · Framer Motion

**Admin Portal** — React 19 · Vite · Tailwind CSS · Recharts

**Deployed on** — Render (API) · Vercel (both frontends)

---

## Live

🌐 **Website** — [modernselfdrive.in](https://modernselfdrive.in)

---

## Key Features

- Real-time vehicle availability with Redis-backed atomic locks to prevent double bookings
- Full booking lifecycle — pending → confirmed → active → completed
- Razorpay payment integration with server-side signature verification
- Document uploads (Aadhaar, driving licence, signature) via Cloudinary
- Invoice generation and automated email delivery
- Owner CRM with fleet management, booking calendar, promo codes, and revenue reports
- Google OAuth customer login
- Automated background jobs — booking reminders, payment reconciliation, daily analytics, and DB backups to Google Sheets
- Live notifications to the owner dashboard via Socket.io
- Production-grade security — Helmet CSP, rate limiting, NoSQL injection prevention, XSS protection, circuit breakers

---

## License

Private — all rights reserved. Not open source.