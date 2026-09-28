# Deploying The Electricity Hub Calendar & KPI Tracker on Vercel

This repository is fully configured and ready for 1-click deployment on **Vercel** as a hybrid Serverless Node.js + Static CDN application.

---

## Architecture Overview

```
calendar-teh/
├── api/
│   └── index.js             # Vercel Serverless Function entry point
├── public/                  # Static assets served globally via Vercel CDN
│   ├── css/
│   ├── js/
│   ├── images/
│   └── index.html
├── services/                # Business logic, date computations & auth
├── data/                    # Bundled seed JSON data (68 observances, 20 KPIs)
├── vercel.json              # Vercel routing, build config, and cron schedules
├── server.js                # Dual-mode server (local express + serverless export)
└── package.json             # Dependencies and build scripts
```

---

## Deployment Option 1: Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "feat: configure Vercel deployment with serverless routes and cron"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new).
   - Select your repository (`calendar-teh`).
   - Framework Preset: Select **Other** (Vercel automatically detects [`vercel.json`](file:///c:/Users/THE%20NEXTIER/Downloads/ADEJUMO%20ADETOMIWA/ADEJUMO%20ADETOMIWA/codes/Tools/Tools/calendar-teh/vercel.json)).
   - Root Directory: `./` (Leave as default).

3. **Configure Environment Variables (Optional)**:
   In the **Environment Variables** panel, add any of the following if you want live external email delivery:
   | Variable | Description | Default / Fallback |
   | :--- | :--- | :--- |
   | `EMAIL_FROM` | Sender email address shown on alerts | `alerts@theelectricityhub.com` |
   | `RESEND_API_KEY` | Resend API key for live email delivery | In-App Outbox Simulator |
   | `SENDGRID_API_KEY` | SendGrid API key | In-App Outbox Simulator |
   | `CRON_SCHEDULE` | Alert check cadence (5-part cron) | `0 8 * * *` (8:00 AM daily) |

   > **Note:** If no email keys are provided, the system functions in **In-App Outbox & Simulation Mode**, allowing you to inspect all generated emails and password reset tokens in real time.

4. Click **Deploy**. Within 60 seconds, your site will be live at `https://your-project.vercel.app`!

---

## Deployment Option 2: Vercel CLI

If you have the Vercel CLI installed:

```bash
# 1. Install Vercel CLI globally (if not already installed)
npm install -g vercel

# 2. Log in to your Vercel account
vercel login

# 3. Deploy preview
vercel

# 4. Deploy directly to production
vercel --prod
```

---

## What Vercel Handles Automatically

1. **High-Performance Static CDN**:
   - All styling (`/css/*`), frontend scripts (`/js/*`), and media assets (`/images/*`) are cached and served from Vercel's edge network.
2. **Serverless REST API**:
   - All `/api/*` endpoints (Auth, Tasks, Calendar feed, Subscribers, Status) execute as AWS Lambda serverless functions.
3. **Daily Automated Cron Jobs**:
   - [`vercel.json`](file:///c:/Users/THE%20NEXTIER/Downloads/ADEJUMO%20ADETOMIWA/ADEJUMO%20ADETOMIWA/codes/Tools/Tools/calendar-teh/vercel.json) configures a daily cron trigger at `0 8 * * *` hitting `/api/cron` to check upcoming statutory observances and task reminder lead times.
4. **Clean SPA Navigation**:
   - Direct visits to `/login`, `/register`, and `/dashboard` load the single-page application without 404 errors.
5. **Serverless File Storage Resilience**:
   - [`services/storageService.js`](file:///c:/Users/THE%20NEXTIER/Downloads/ADEJUMO%20ADETOMIWA/ADEJUMO%20ADETOMIWA/codes/Tools/Tools/calendar-teh/services/storageService.js) automatically initializes seed data into `/tmp/calendar-teh-data` on serverless execution with in-memory fallbacks, preventing read-only filesystem errors (`EROFS`).

---

## Local Development

You can continue testing and developing locally at any time:
```bash
npm run dev
# or
npm start
```
The app will run locally at `http://localhost:3000`.
