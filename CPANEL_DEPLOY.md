# cPanel Deployment Guide

## Prerequisite: Account Requirements

Your cPanel must support:
- Node.js version 18+
- MongoDB (if not available, use MongoDB Atlas cloud)
- Redis (optional, can use in-memory fallback)

---

## Step 1: Prepare Your Application

### 1.1 Update package.json for cPanel

```json
{
  "name": "modern-selfdrive-server",
  "version": "1.0.0",
  "main": "server/server.js",
  "scripts": {
    "start": "node server.js",
    "seed": "node server/seed.js",
    "build": "npm run build --prefix client"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.2 Create Production Environment File

Create `server/.env` with all required variables:

```bash
# REQUIRED
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/modernselfdrive?retryWrites=true&w=majority
JWT_SECRET=your-32-character-minimum-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OPTIONAL (with fallbacks)
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com
CLIENT_URL_PROD=https://www.yourdomain.com

# REDIS (optional - will use in-memory if not set)
# REDIS_URL=redis://localhost:6379
```

---

## Step 2: Configure Apache (.htaccess)

Create `server/.htaccess` in the application root:

```apache
RewriteEngine On

# Serve static files from public folder
RewriteCond %{REQUEST_URI} ^/public [NC]
RewriteRule ^ public%{REQUEST_URI} [L]

# Proxy API requests to Node.js
RewriteCond %{REQUEST_URI} ^/api [NC]
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]

# WebSocket support
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]

# If using frontend in same app
RewriteCond %{REQUEST_URI} !^/api
RewriteCond %{REQUEST_URI} !^/uploads
RewriteCond %{REQUEST_URI} !\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$
RewriteRule ^(.*)$ /index.html [L]
```

---

## Step 3: Upload to cPanel

### Method A: Using File Manager

1. **Login to cPanel**
2. Go to **File Manager** → **public_html**
3. Create folder named `api` or `backend`
4. Upload all server files (except node_modules)

5. **Upload to api/ folder:**
   - All files from `server/` folder
   - Create subfolders: `routes/`, `models/`, `middleware/`, `services/`, `utils/`

### Method B: Using FTP

```bash
# Connect via FTP/SFTP
Host: yourdomain.com
Port: 21 (or 22 for SFTP)
Username: your-cpanel-username
Password: your-cpanel-password
```

Upload the entire project, then SSH in and run `npm install`

---

## Step 4: Set Up Node.js Application in cPanel

### 4.1 Open Node.js Setup

1. **cPanel Dashboard**
2. Search for **"Setup Node.js App"** (or **"Node.js"**)
3. Click **"Create Application"**

### 4.2 Configure Application

```
Application Mode: Production
Application Root: api (or /backend)
Application URL: yourdomain.com/api
Application Start up file: server.js

Node.js Version: 18 (or 20)
```

### 4.3 Install Dependencies

In cPanel Node.js setup page:
1. Click **"Start"** to install dependencies
2. Wait for `npm install` to complete
3. Check logs for errors

---

## Step 5: Frontend Deployment

### Option A: Same cPanel (Recommended for Shared Hosting)

1. **Build React app locally:**
```bash
cd client
npm install
npm run build
```

2. **Upload contents of `client/dist`:**
   - Go to cPanel → File Manager → public_html
   - Upload all files from `dist` folder

3. **Create .htaccess for frontend:**
```apache
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [L]
```

### Option B: Use Vercel/Netlify (Free - Recommended)

```bash
# Push to GitHub, connect to Vercel
# Frontend auto-deploys from client/ folder
```

**vite.config.js update:**
```javascript
export default defineConfig({
  base: '/',  // or '/your-subfolder/'
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    host: true
  }
})
```

---

## Step 6: Verify Deployment

### Test API Endpoints

```bash
# Health check
curl https://yourdomain.com/api/health

# Should return:
{ "status": "ok", "uptime": 12345, "timestamp": "..." }
```

### Test Frontend

```
Visit: https://yourdomain.com
Should load the home page
```

---

## Troubleshooting Common Issues

### Issue 1: "npm install failed"

**Solution:** Increase Node.js memory:
```bash
NODE_OPTIONS=--max_old_space_size=4096 npm install
```

### Issue 2: "MongoDB connection failed"

**Solution:** 
- Use MongoDB Atlas (cloud) - free tier available
- Or check cPanel MongoDB credentials

### Issue 3: "Port already in use"

**Solution:** cPanel assigns random port. Update .env:
```bash
PORT=5000  # or whatever cPanel assigns
```

### Issue 4: Static files not loading

**Solution:** Check .htaccess paths match your folder structure

### Issue 5: 500 Internal Server Error

**Solution:** Check error logs in cPanel:
```
cPanel → Metrics → Errors
```

---

## Complete Environment Variables Checklist

```bash
# ===================
# REQUIRED
# ===================
MONGO_URI=mongodb+srv://...
JWT_SECRET=minimum-32-characters-secret
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# ===================
# SERVER
# ===================
NODE_ENV=production
PORT=5000

# ===================
# URLs
# ===================
CLIENT_URL=http://localhost:5173
CLIENT_URL_PROD=https://yourdomain.com

# ===================
# OPTIONAL FEATURES
# ===================
# REDIS_URL=redis://...
# STRIPE_SECRET_KEY=sk_live_...
# RAZORPAY_KEY_ID=...
# GOOGLE_CLIENT_ID=...
```

---

## Recommended Hosting Providers for This Project

| Provider | Pros | Cons | Cost |
|----------|------|------|------|
| **Namecheap** | Cheap, cPanel included | Limited Node.js | ~$10/mo |
| **SiteGround** | Good support, managed | Limited resources | ~$15/mo |
| **A2 Hosting** | Fast, Node.js support | Varies | ~$15/mo |
| **Railway** | Full Node.js support | Not cPanel | $5-20/mo |
| **Render** | Free tier available | Not cPanel | Free-$25/mo |

### Recommended Setup

For best results with this project:

1. **Backend:** Railway or Render (free Node.js)
2. **Database:** MongoDB Atlas (free tier)
3. **Images:** Cloudinary (free tier)
4. **Frontend:** Vercel (free)

This avoids cPanel limitations entirely!