# Required Configuration - What You Need to Fill In

## Step 1: Create .env File

Create a file named `.env` in the `server/` folder with these values:

```env
# ===========================================
# REQUIRED - Error if missing
# ===========================================

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/modernselfdrive?retryWrites=true&w=majority

JWT_SECRET=<generate-a-32-character-or-longer-secret>

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>

# ===========================================
# SERVER CONFIG
# ===========================================

NODE_ENV=production
PORT=5000
CLIENT_URL=http://localhost:5173
CLIENT_URL_PROD=https://your-production-domain.com

# ===========================================
# OPTIONAL - Payment Gateway
# ===========================================

# For Stripe (get from stripe.com/dashboard):
# STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx

# For Razorpay (get from razorpay.com/dashboard):
# RAZORPAY_KEY_ID=xxxxxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxx

# ===========================================
# OPTIONAL - OAuth
# ===========================================

# For Google Login (get from console.cloud.google.com):
# GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=xxxxxxxxxxxxxxxx

# ===========================================
# OPTIONAL - Cache
# ===========================================

# Get free from upstash.com or use built-in memory fallback:
# REDIS_URL=redis://default:xxxxx@xxxxx.upstash.io:6379
```

## Step 2: Where to Get Each API Key

### MongoDB (Free)
1. Go to https://www.mongodb.com/atlas
2. Create free account → Create cluster
3. Create user with password
4. Network Access → Allow All (0.0.0.0)
5. Database → Connect → Copy URI
6. Replace `<password>` with your user's password

### JWT_SECRET (Generate Yourself)
Run this command in terminal:
```bash
openssl rand -base64 32
```
Or use: https://generate-random.com/

### Cloudinary (Free)
1. Go to https://cloudinary.com
2. Sign up → Dashboard
3. Copy: Cloud Name, API Key, API Secret

### Stripe (Optional - for payments)
1. Go to https://stripe.com
2. Activate account
3. Developers → API Keys
4. Copy Secret Key (starts with `sk_live_`)
5. Webhooks → Create endpoint → Copy signing secret

### Razorpay (Optional - for payments)
1. Go to https://razorpay.com
2. Create account → Settings → API keys
3. Copy Key ID and Key Secret

### Google OAuth (Optional - for login)
1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. OAuth 2.0 Client ID
4. Copy Client ID and Client Secret

---

## What You Need to Fill

| Variable | Required | Where to Get | Free? |
|----------|----------|-------------|-------|
| `MONGO_URI` | ✅ Yes | MongoDB Atlas | ✅ |
| `JWT_SECRET` | ✅ Yes | Generate yourself | ✅ |
| `CLOUDINARY_CLOUD_NAME` | ✅ Yes | Cloudinary | ✅ |
| `CLOUDINARY_API_KEY` | ✅ Yes | Cloudinary | ✅ |
| `CLOUDINARY_API_SECRET` | ✅ Yes | Cloudinary | ✅ |
| `STRIPE_SECRET_KEY` | No | Stripe.com | ❌ |
| `RAZORPAY_KEY_ID` | No | Razorpay.com | ❌ |
| `GOOGLE_CLIENT_ID` | No | Google Cloud | ✅ |

---

## Quick Setup Checklist

- [ ] Create MongoDB Atlas account → Get connection string
- [ ] Generate JWT_SECRET
- [ ] Create Cloudinary account → Get API keys
- [ ] Fill in `.env` file
- [ ] Run `npm install` in both server/ and client/
- [ ] Run `npm run seed` to add sample cars
- [ ] Deploy to Render/Vercel