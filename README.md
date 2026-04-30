# Modern Selfdrive Car

Modern Selfdrive Car is a premium MERN stack car rental platform based in Junagadh, Gujarat, India.
It provides a customized booking experience tailored for the local market, offering Self Drive, With Driver, Airport Pickup, and Bike Rentals.

## Tech Stack
- Frontend: React, Tailwind CSS, Vite
- Backend: Node.js, Express
- Database: MongoDB

## Features
- Fully rebranded to "Modern Selfdrive Car"
- Currency localization to INR (₹)
- Custom Indian fleet (Hatchback, Sedan, SUV, Bike, Scooter)
- Drive Options: Self Drive or With Driver
- Indian KYC implementation (Aadhaar, License)
- WhatsApp booking confirmation integration
- Admin Dashboard for fleet and analytics management

## Setup Instructions

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies for the server:
   ```bash
   cd server
   npm install
   ```
3. Install dependencies for the client:
   ```bash
   cd client
   npm install
   ```

### Environment Variables

Copy `.env.example` to `.env` in both `client` and `server` directories and fill in the required keys (e.g., MongoDB URI, JWT Secret, WhatsApp API Key).

### Seed Data

Populate the database with the initial fleet of 8 Indian vehicles:
```bash
cd server
node seed.js
```

### Run the App

Start the backend:
```bash
cd server
npm start
```

Start the frontend:
```bash
cd client
npm run dev
```

## Contact
**Modern Selfdrive Car**
GIDC 1, Joshipara, Junagadh - 362002, Gujarat
Phone: +91 87924 92717
Email: booking@modernselfdrive.in
