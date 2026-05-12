# 🚗 Modern Selfdrive

> Full-stack car rental platform — Junagadh's trusted self-drive car rental since 2017.

[![Deploy Public](https://img.shields.io/badge/Public-Vercel-black?logo=vercel)](https://modernselfdrive.in)
[![Deploy Portal](https://img.shields.io/badge/Portal-Vercel-black?logo=vercel)](https://admin.modernselfdrive.in)
[![Deploy API](https://img.shields.io/badge/API-Render-46E3B7?logo=render)](https://render.com)

---

## Architecture

```
modern-selfdrive/
├── apps/
│   ├── public/          # Customer-facing website (React + Vite)
│   └── portal/          # Owner management portal (React + Vite)
├── server/              # REST API + WebSocket server (Express + MongoDB)
├── package.json         # Monorepo dev scripts
└── README.md
```

| Layer | Stack | Hosting |
|-------|-------|---------|
| **Public Website** | React 19, Vite, TailwindCSS | Vercel |
| **Owner Portal** | React 19, Vite, TailwindCSS, Recharts | Vercel |
| **Backend API** | Express 4, MongoDB Atlas, Socket.IO | Render |

---

## Local Development

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Jeeerryyy/Car-Rental-Modern-.git
cd Car-Rental-Modern-

# 2. Install all dependencies
npm run install:all

# 3. Configure environment variables
cp server/.env.example server/.env
cp apps/public/.env.example apps/public/.env
cp apps/portal/.env.example apps/portal/.env
# Edit each .env file with your values

# 4. Seed the database (first time only)
cd server && npm run seed && cd ..

# 5. Start all three services
npm run dev
```

This starts:
- **API** → `http://localhost:5000`
- **Public** → `http://localhost:5173`
- **Portal** → `http://localhost:5174`

---

## Deployment

### Backend API → Render

1. Create a [Render](https://render.com) account
2. New → **Web Service** → Connect your GitHub repo
3. Set **Root Directory** to `server`
4. **Build Command:** `npm install`
5. **Start Command:** `node src/server.js`
6. Add environment variables from `server/.env.example`
7. Copy the Render URL (e.g. `https://modern-drive-api-xxxx.onrender.com`)

### Public Website → Vercel

1. Create a [Vercel](https://vercel.com) account
2. Import your GitHub repo
3. Set **Root Directory** to `apps/public`
4. **Framework Preset:** Vite
5. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-url.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth client ID
   - `VITE_APP_NAME` = `Modern Selfdrive`
6. Add custom domain: `modernselfdrive.in`

### Owner Portal → Vercel

1. Create a **second** Vercel project from the same repo
2. Set **Root Directory** to `apps/portal`
3. **Framework Preset:** Vite
4. Add environment variables:
   - `VITE_API_URL` = `https://your-render-url.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://your-render-url.onrender.com`
   - `VITE_APP_NAME` = `Modern Selfdrive Portal`
5. Add custom domain: `admin.modernselfdrive.in`

### Keep-Alive (Render Free Tier)

The API includes a built-in cron job that pings `/health` every 10 minutes to prevent Render's free tier from spinning down. No external services needed.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `NODE_ENV` | ✅ | `production` |
| `PORT` | ✅ | `5000` (Render default) |
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Owner auth secret (64+ chars) |
| `CUSTOMER_JWT_SECRET` | ✅ | Customer auth secret (64+ chars) |
| `CLIENT_URL` | ✅ | `https://modernselfdrive.in` |
| `PORTAL_URL` | ✅ | `https://admin.modernselfdrive.in` |
| `CLOUDINARY_*` | ✅ | Image storage credentials |
| `GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `RAZORPAY_*` | ⬜ | Payment gateway (when enabled) |
| `SMTP_*` | ⬜ | Email sending credentials |

### Frontend (`apps/public/.env` & `apps/portal/.env`)

| Variable | Required | Description |
|----------|:--------:|-------------|
| `VITE_API_URL` | ✅ | Backend API URL |
| `VITE_SOCKET_URL` | ✅ | WebSocket server URL |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google OAuth client ID |
| `VITE_APP_NAME` | ✅ | App display name |

---

## Features

- 🔐 **Authentication** — Email/password + Google OAuth for customers, owner portal login
- 🚗 **Fleet Management** — Add/edit/delete cars with Cloudinary image uploads
- 📅 **Booking System** — Real-time availability, date blocking, booking calendar
- 💳 **Payments** — Razorpay integration (toggleable)
- 📊 **Analytics** — Owner dashboard with revenue charts and booking stats
- 🔔 **Real-Time Notifications** — Socket.IO powered alerts
- 📱 **Responsive** — Mobile-first design for all screens
- 🔍 **SEO Optimized** — Meta tags, semantic HTML, fast load times

---

## License

Private — © 2017–2026 Modern Selfdrive Car, Junagadh