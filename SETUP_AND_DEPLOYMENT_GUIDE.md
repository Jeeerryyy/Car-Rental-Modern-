# Modern Drive — Production Setup & Deployment Guide

This guide provides a comprehensive, step-by-step walkthrough to configure external cloud accounts, provision production APIs, set up environmental security keys, and deploy the entire Modern Drive application stack live on **Render** (backend) and **Vercel** (frontend apps).

---

## Table of Contents
1. [Prerequisites & Account Checklists](#1-prerequisites--account-checklists)
2. [Step 1: MongoDB Atlas Configuration (Database)](#step-1-mongodb-atlas-configuration-database)
3. [Step 2: Redis Provider Configuration (Caching & Rate Limiting)](#step-2-redis-provider-configuration-caching--rate-limiting)
4. [Step 3: Cloudinary Setup (Image Storage)](#step-3-cloudinary-setup-image-storage)
5. [Step 4: Google Cloud Console Setup (OAuth & Google Sheets)](#step-4-google-cloud-console-setup-oauth--google-sheets)
6. [Step 5: Razorpay Setup (Payments & Webhooks)](#step-5-razorpay-setup-payments--webhooks)
7. [Step 6: Gmail SMTP Setup (Notification Service)](#step-6-gmail-smtp-setup-notification-service)
8. [Step 7: Render Deployment (Backend API Server)](#step-7-render-deployment-backend-api-server)
9. [Step 8: Vercel Deployment (Public Site & Portal Dashboard)](#step-8-vercel-deployment-public-site--portal-dashboard)
10. [Step 9: Git Pushing Guide](#step-9-git-pushing-guide)

---

## 1. Prerequisites & Account Checklists

To run this platform fully in production, ensure you have registered accounts on the following platforms:
- [GitHub](https://github.com) (For codebase hosting and continuous deployment)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier or serverless database)
- [Upstash Redis](https://upstash.com/) or [Render Redis](https://render.com/) (For rate limiting and distributed caching)
- [Cloudinary](https://cloudinary.com/) (Free tier for uploading images)
- [Google Cloud Console](https://console.cloud.google.com/) (For Google Sign-In and sheet synchronizations)
- [Razorpay](https://razorpay.com/) (For processing local transactions in test/live mode)
- [Gmail Account](https://mail.google.com) (For transactional mailers)

---

## Step 1: MongoDB Atlas Configuration (Database)

Modern Drive utilizes MongoDB for accounts, bookings, cars, logs, and state retention.

### Step-by-Step Setup:
1. Log in to **[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**.
2. Click **Create** to spin up a new Shared Cluster (M0 Free tier is sufficient for launch). Select your preferred region (e.g., AWS / N. Virginia or Mumbai) and click **Create Cluster**.
3. Under **Security -> Database Access**:
   - Click **Add New Database User**.
   - Set Authentication Method to **Password**.
   - Create a username and secure password (avoid using special characters like `@`, `:`, or `/` in the password as they can break URI formatting; if you must, make sure to URL-encode them).
   - Assign User Privileges as **Read and write to any database**.
4. Under **Security -> Network Access**:
   - Click **Add IP Address**.
   - Choose **Allow Access From Anywhere** (`0.0.0.0/0`) or whitelist Render's outbound IPs. Since Render's free tier IPs are dynamic, choosing `0.0.0.0/0` is recommended for initial launch.
5. Under **Deployment -> Database**:
   - Click **Connect** on your Cluster.
   - Choose **Drivers** (Node.js).
   - Copy the provided connection string. It will look like this:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/modern-drive?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your created database credentials. This will be your `MONGO_URI`.

---

## Step 2: Redis Provider Configuration (Caching & Rate Limiting)

Redis acts as our high-performance distributed caching mechanism, job queue dispatcher, and rate limiting backend. You can use either **Render Redis** or **Upstash Redis** (Recommended for performance consistency on serverless layers).

### Option A: Upstash Redis (Recommended)
1. Sign up/log in to **[Upstash](https://upstash.com/)**.
2. Click **Create Database**.
3. Name your database, select a primary region close to your Render deployment, and click **Create**.
4. Scroll down to the **Node.js ioredis** or **Redis Connect** tab.
5. Copy the **Redis URL**. It will look like this:
   ```text
   redis://default:yourpassword@your-endpoint.upstash.io:30000
   ```
6. This URL will be mapped to the `REDIS_URL` environment variable.

### Option B: Render Redis
1. Log in to **[Render](https://render.com/)**.
2. Click **New +** and select **Redis**.
3. Choose a name, select the same region as your main web service, and click **Create Redis**.
4. Once active, copy the **Internal Redis URL** (if deploying within Render) or **External Redis URL** (if testing locally or across providers).

---

## Step 3: Cloudinary Setup (Image Storage)

All car listings, customer driving licenses, and verification assets are uploaded directly and securely to Cloudinary.

### Step-by-Step Setup:
1. Log in to **[Cloudinary](https://cloudinary.com/)**.
2. Navigate to your **Dashboard**.
3. Locate and copy the following credentials:
   - **Cloud Name** (maps to `CLOUDINARY_CLOUD_NAME`)
   - **API Key** (maps to `CLOUDINARY_API_KEY`)
   - **API Secret** (Click "View API Secret" - maps to `CLOUDINARY_API_SECRET`)

---

## Step 4: Google Cloud Console Setup (OAuth & Google Sheets)

Google services are split into **Customer Google Login** (OAuth) and **Google Sheets API Sync** (Service Account).

### Part A: Google OAuth (Google Sign-In)
1. Go to the **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Click the project dropdown and click **New Project** to create one.
3. Search for **OAuth consent screen** in the navigation bar:
   - Set User Type to **External** and click **Create**.
   - Input your App name (e.g., "Modern Drive") and support email.
   - Proceed to **Scopes** and add `./auth/userinfo.profile` and `./auth/userinfo.email`.
   - Add your developer email under Test Users.
4. Navigate to **Credentials** in the left sidebar:
   - Click **+ Create Credentials** -> **OAuth client ID**.
   - Select Application Type: **Web application**.
   - Under **Authorized JavaScript origins**, add:
     - `http://localhost:5173` (Local Public site)
     - `https://your-public-client-url.vercel.app` (Vercel Production url)
   - Under **Authorized redirect URIs**, add:
     - `https://your-backend-api-url.onrender.com/api/customer/auth/google/callback`
   - Click **Create** and copy the generated **Client ID** (`GOOGLE_CLIENT_ID`) and **Client Secret** (`GOOGLE_CLIENT_SECRET`).

### Part B: Google Sheets API (Optional Operational Auto-Sync)
If you wish to sync your system bookings, rentals, and metrics to Google Sheets:
1. In Google Cloud Console, enable the **Google Sheets API** and **Google Drive API** for your project.
2. Navigate to **Credentials** -> **+ Create Credentials** -> **Service Account**.
3. Name your service account and click **Create and Continue**.
4. Go to the newly created service account, click the **Keys** tab -> **Add Key** -> **Create new key** (JSON format).
5. Download the JSON file. Extract:
   - `client_email` (maps to `GOOGLE_SERVICE_ACCOUNT_EMAIL`)
   - `private_key` (maps to `GOOGLE_PRIVATE_KEY` - replace raw newlines with `\n` in env settings)
6. Go to **Google Sheets**, create a blank spreadsheet, copy its ID from the URL (`https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`), and assign it to `GOOGLE_SHEET_ID`.
7. **Crucial**: Click **Share** on your Google Sheet and invite your service account `client_email` as an **Editor** so the server can write database data to it.

---

## Step 5: Razorpay Setup (Payments & Webhooks)

Razorpay handles secure transaction checkouts, refunds, and logs booking confirmations.

### Step-by-Step Setup:
1. Log in to **[Razorpay Dashboard](https://dashboard.razorpay.com/)**.
2. Switch to **Test Mode** (or Live Mode if verified).
3. Navigate to **Account & Settings** -> **API Keys**:
   - Click **Generate Key**.
   - Copy the **Key ID** (`RAZORPAY_KEY_ID`) and **Key Secret** (`RAZORPAY_SECRET`).
4. Navigate to **Settings -> Webhooks**:
   - Click **+ Add New Webhook**.
   - Webhook URL: `https://your-backend-api-url.onrender.com/api/payment/webhook` (Update this after deploying on Render).
   - Secret: Create a secure random string (maps to `RAZORPAY_WEBHOOK_SECRET`).
   - Active Events: Select `payment.captured` and `refund.processed`.
   - Save the webhook.

---

## Step 6: Gmail SMTP Setup (Notification Service)

Gmail is used for sending verification OTPs, password reset emails, and rental invoice receipts.

### Step-by-Step Setup:
1. Log in to your Google Account Settings.
2. Go to **Security** and enable **2-Step Verification** (Mandatory to generate app passwords).
3. Search for **App passwords** in the search bar.
4. Input "Modern Drive" as the app name and click **Create**.
5. Copy the generated **16-character password code** (spaces can be omitted).
6. Set:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `587`
   - `SMTP_USER`: Your gmail account email (e.g., `sender@gmail.com`)
   - `SMTP_PASS`: Your copied 16-character app password
   - `SMTP_FROM`: The display sender email (usually same as `SMTP_USER`)

---

## Step 7: Render Deployment (Backend API Server)

We deploy the server layer directly on Render.

### Step-by-Step Setup:
1. Log in to **[Render](https://render.com/)**.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub account and select your `Car-Rental-Modern-` repository.
4. Configure service details:
   - **Name**: `modern-drive-api`
   - **Region**: Select region closest to your users or database
   - **Branch**: `master` (or main)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click **Advanced** and add the following **Environment Variables**:

| Env Key | Production Value / Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `DISABLE_RATE_LIMIT` | `false` |
| `MONGO_URI` | Your full database connection string (from Step 1) |
| `REDIS_URL` | Your Redis connection string (from Step 2) |
| `JWT_SECRET` | Secure random string (> 32 chars) |
| `JWT_EXPIRY` | `7d` |
| `CUSTOMER_JWT_SECRET` | Secure random string (> 32 chars, different from JWT_SECRET) |
| `CUSTOMER_JWT_EXPIRES_IN` | `30d` |
| `CLIENT_URL` | `https://your-public-client-url.vercel.app` (From Step 8) |
| `PORTAL_URL` | `https://your-portal-client-url.vercel.app` (From Step 8) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name (from Step 3) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key (from Step 3) |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret (from Step 3) |
| `PAYMENT_ENABLED` | `true` |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (from Step 5) |
| `RAZORPAY_SECRET` | Razorpay Key Secret (from Step 5) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Webhook Secret (from Step 5) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | Your email address (from Step 6) |
| `SMTP_PASS` | Your 16-char Gmail app password (from Step 6) |
| `SMTP_FROM` | Your email address (from Step 6) |
| `GOOGLE_CLIENT_ID` | Google Client ID (from Step 4) |
| `GOOGLE_CLIENT_SECRET` | Google Client Secret (from Step 4) |
| `GOOGLE_SHEET_ID` | (Optional) Spreadsheet ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | (Optional) Service account email |
| `GOOGLE_PRIVATE_KEY` | (Optional) Service account private key |

6. Click **Create Web Service**. Render will install, check schemas, run dependencies, and deploy your live API.

---

## Step 8: Vercel Deployment (Public Site & Portal Dashboard)

The frontend applications (`apps/public` and `apps/portal`) are deployed to **Vercel** with full environmental bindings.

### Part A: Deploy Public Site (`apps/public`)
1. Log in to **[Vercel](https://vercel.com/)**.
2. Click **Add New** -> **Project**.
3. Select the `Car-Rental-Modern-` repository.
4. Set up deployment options:
   - **Project Name**: `modern-drive-public`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/public`
5. Click **Environment Variables** and add:

| Env Key | Value |
| :--- | :--- |
| `VITE_APP_NAME` | `Modern Selfdrive` |
| `VITE_API_URL` | `https://your-backend-api-url.onrender.com/api` (Render URL + `/api`) |
| `VITE_SOCKET_URL` | `https://your-backend-api-url.onrender.com` (Render URL) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID (from Step 4) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (from Step 5) |

6. Click **Deploy**. Copy the live URL generated (e.g., `https://modern-drive-public.vercel.app`).

### Part B: Deploy Owner/Staff Portal (`apps/portal`)
1. In Vercel, click **Add New** -> **Project**.
2. Select the `Car-Rental-Modern-` repository.
3. Set up deployment options:
   - **Project Name**: `modern-drive-portal`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `apps/portal`
4. Click **Environment Variables** and add:

| Env Key | Value |
| :--- | :--- |
| `VITE_APP_NAME` | `Modern Selfdrive Portal` |
| `VITE_API_URL` | `https://your-backend-api-url.onrender.com/api` (Render URL + `/api`) |
| `VITE_SOCKET_URL` | `https://your-backend-api-url.onrender.com` (Render URL) |

5. Click **Deploy**. Copy the live URL generated (e.g., `https://modern-drive-portal.vercel.app`).

---

## Step 9: Git Pushing Guide

Since you've made security audits, moved scripts, and added enterprise observability to the repository, you need to commit and push these updates to your GitHub repository.

### Stage, Commit, and Push steps:
1. Ensure all sensitive information is excluded from your stage (the `.gitignore` is pre-configured to ignore `.env` files).
2. Open your terminal in the project root directory.
3. Stage all modified and new files:
   ```bash
   git add .
   ```
4. Commit the changes:
   ```bash
   git commit -m "chore: enterprise hardening, script relocation, and documentation sync"
   ```
5. Push the branch to GitHub:
   ```bash
   git push origin master
   ```

*(If prompted, log in with your GitHub Personal Access Token or secure web auth).*

Your Render and Vercel services will automatically trigger new builds upon receiving this push, updating your live application with all performance and security hardening enhancements.
