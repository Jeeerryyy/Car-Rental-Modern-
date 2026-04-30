# Modern Selfdrive Car — MilesWeb Deployment Guide

## Architecture
```
┌─────────────────────────────┐     ┌──────────────────────────────┐
│  modernselfdrivecar.com     │     │  api.modernselfdrivecar.com  │
│  (Apache → static files)    │────▶│  (Node.js via cPanel)        │
│  public_html/dist/*         │     │  ~/nodeapp/server.js         │
└─────────────────────────────┘     └──────────┬───────────────────┘
                                               │
                                    ┌──────────▼───────────────────┐
                                    │  MongoDB Atlas (Free M0)     │
                                    │  Region: Mumbai ap-south-1   │
                                    └──────────────────────────────┘
```

---

## Step 1 — MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com → Create free account
2. Create project: `ModernSelfdrivecar`
3. Create free M0 cluster → Provider: AWS → Region: Mumbai (ap-south-1)
4. Create database user: `msc_admin` / [strong password]
5. Network Access → Allow Access from Anywhere (0.0.0.0/0)
6. Get connection string from Connect → Drivers → Node.js
7. Save as `MONGO_URI`

---

## Step 2 — Upload Frontend

1. Log in to cPanel → File Manager → `public_html/`
2. Delete default placeholder files
3. Upload all contents of `client/dist/` into `public_html/`
4. Ensure `.htaccess` uploaded (enable "Show Hidden Files")
5. Test: https://modernselfdrivecar.com should load the React app

---

## Step 3 — Deploy Backend

1. cPanel → Subdomains → Create `api.modernselfdrivecar.com`
   - Document root: `/home/[username]/nodeapp/public`
2. cPanel → Setup Node.js App → Create Application:
   - Node.js: 20.x, Mode: Production
   - Root: `nodeapp`, URL: `api.modernselfdrivecar.com`
   - Startup file: `server.js`
3. Upload server files to `~/nodeapp/`
4. Set environment variables in Node.js App manager
5. Click "NPM Install" then "Restart"
6. Test: https://api.modernselfdrivecar.com/health

---

## Step 4 — SSL & Seed

1. cPanel → SSL/TLS → Issue Let's Encrypt for both domains
2. Enable Force HTTPS Redirect
3. Via Terminal: `cd ~/nodeapp && node seed.js && node scripts/createAdmin.js && node scripts/seedReviews.js`

---

## Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
MONGO_URI=mongodb+srv://msc_admin:<password>@modern-selfdrive-production.xxxxx.mongodb.net/modernselfdrivecar?retryWrites=true&w=majority
JWT_SECRET=[64-char hex — generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN=30d
CLIENT_URL=https://modernselfdrivecar.com
CLIENT_URL_PROD=https://modernselfdrivecar.com
BUSINESS_NAME=Modern Selfdrive Car
BUSINESS_PHONE=+918792492717
BUSINESS_WHATSAPP=918792492717
BUSINESS_EMAIL=info@modernselfdrivecar.com
BUSINESS_ADDRESS=GIDC 1 Joshipara Junagadh 362002 Gujarat
BUSINESS_CITY=Junagadh
BUSINESS_STATE=Gujarat
CURRENCY=INR
CURRENCY_SYMBOL=₹
```
