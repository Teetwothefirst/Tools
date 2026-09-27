# Interactive Celebration & Energy-Sector Calendar with Alert Mailing List

A visually rich, culturally vibrant web calendar application celebrating statutory Nigerian public holidays, African Union continental observances, United Nations international days, and the Power & Clean Energy Sector. Features an automated daily advance alerting engine that sends date-based email notifications to Work, Business, and Personal subscribers.

---

## 🌟 Key Features

### 1. Multi-Layer Observance Architecture
- **🇳🇬 Nigeria Layer**: Official statutory public holidays (Independence Day, Democracy Day, Workers' Day, Christmas, Boxing Day, New Year's Day, etc.) and national observances.
- **🌍 Africa Layer**: Continental days established by the African Union (Africa Day, Africa Industrialization Day, Day of the African Child, Africa Human Rights Day, Nelson Mandela Day, etc.).
- **⚡ Power & Energy Sector Layer**: Dedicated observance layer for on-grid, off-grid solar, renewables, clean cooling, energy efficiency, and hydrogen transitions (UN International Day of Clean Energy, World Energy Day, World Off-Grid Solar Day, Global Wind Day, Energy Efficiency Day, etc.). Industry-recognized vs. official UN days are clearly marked.
- **🌐 Global Layer**: UN-designated International Days (International Women's Day, World Health Day, Earth Day, World Environment Day, Human Rights Day, etc.).

### 2. Multi-Year & Variable Date Computing
- **Fixed Gregorian Dates**: Recurring yearly dates (e.g. Oct 1, Jan 26, May 25).
- **Computed Easter Holidays**: Good Friday and Easter Monday are computed programmatically using the Anonymous Gregorian algorithm (Meeus/Jones/Butcher) for any target year.
- **Islamic Lunar Observances**: Eid al-Fitr, Eid al-Adha, and Eid el-Maulud are resolved via astronomical projections and an **Admin Moon-Sighting Registry**, allowing non-developers to adjust dates by +/- 1 to 2 days based on official Sultanate / NSCIA declarations without a code redeployment.

### 3. Multiple Calendar Views
- **Month Grid View**: 7-column interactive calendar with toggleable Sunday/Monday start, previous/next navigation, "Today" quick-jump, colored layer indicators, and event pills.
- **Year-at-a-Glance View**: 12 mini-month cards with observance heat indicators. Clicking any month or day jumps directly into details.
- **Agenda / List View**: Chronological timeline grouped by month with large date numbers, countdown badges ("TODAY 🎉", "TOMORROW", "In 5 days"), and quick-action buttons.
- **Real-Time Search & Layer Filters**: Instant multi-select filtering for Nigeria, Africa, Global, and Energy Sector with real-time event counts.

### 4. Advance Email Alerting & Mailing List
- **Audience Segmentation**: Subscribers select their email context (**Work / Business / Personal**).
- **Customizable Preferences**: Subscribers choose which layers to follow and preferred lead times (**7 days, 3 days, 1 day, or same day**).
- **Consent & Privacy**: Complies with the **Nigeria Data Protection Act (NDPA)**, **NDPR**, and CAN-SPAM regulations. Features a 1-click unsubscribe flow and preference manager.
- **Automated Scheduler**: A `node-cron` background daemon runs daily at 08:00 WAT to evaluate active subscribers against upcoming events.
- **De-Duplication**: Prevents duplicate sends by recording `(subscriber_id, event_id, year, lead_time_days)`.
- **Pluggable Email Engine**: Supports **Resend**, **SendGrid**, **SMTP**, or a built-in **Interactive Email Outbox Inspector** for testing without third-party API keys.

### 5. Control Center & Admin Hub
- **Events Manager**: Add custom observances, update details, or toggle official/unofficial verification status.
- **Moon-Sighting Registry**: Update Islamic holiday dates for 2024–2028.
- **Alert Engine Simulator**: Test alert dispatch for any date (e.g., test 7-day alert for Nigeria Independence Day on `2026-09-24`).
- **Subscribers Analytics**: View total subscribers, active subscribers, and breakdowns by Work, Business, and Personal segments.
- **Live Outbox & Delivery Inspector**: Preview fully rendered HTML emails with celebratory Ankara ribbons, countdown banners, and unsubscribe links.

---

## 🎨 Visual Direction & Aesthetics
- **Vibrant African & Nigerian Palette**: Nigerian Flag Green (`#008751`), Terracotta Clay (`#D9531E`), Sunflower Gold (`#F4B41A`), Deep Royal Indigo (`#1B1947`), and Ankara Coral (`#D9383A`).
- **Ankara Motifs**: Subtle geometric SVG patterns, warm ribbons, and celebration accents.
- **Modern Typography**: Google Fonts **Outfit** and **Plus Jakarta Sans**.
- **Micro-Animations**: Cell hover elevation, glowing event badges, view transitions, and celebration confetti flourishes.
- **Dark Mode**: Seamless light and dark mode toggling.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm

### Installation
```bash
# Navigate to project directory
cd calendar-teh

# Install dependencies (already installed if using this repo)
npm install
```

### Running Locally
```bash
# Start the web server and alerting daemon
npm start
```
The server will start at: **`http://localhost:3000`**

---

## ⚙️ Configuration (.env)

Edit `.env` to configure your email provider:

```ini
PORT=3000
CRON_SCHEDULE=0 8 * * *
EMAIL_FROM=alerts@nigeriacalendar.org

# Option 1: Resend (Recommended)
# RESEND_API_KEY=re_your_api_key

# Option 2: SendGrid
# SENDGRID_API_KEY=SG.your_api_key

# Option 3: Custom SMTP / Mailtrap / Ethereal
# SMTP_HOST=smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_USER=your_user
# SMTP_PASS=your_password
```

> **Note:** If no third-party email keys are set, the application operates in **Simulation / In-App Outbox Mode**. All generated HTML emails are recorded in `data/outbox.json` and can be inspected live in the **Admin Hub → Email Outbox Inspector** tab!

---

## 📡 REST API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/events` | `GET` | List resolved events for a year (`?year=2026&scope=energy&month=10`) |
| `/api/events/:id` | `GET` | Get single event details with computed date for target year |
| `/api/events` | `POST` | Add a new observance (Admin) |
| `/api/events/:id` | `PUT` | Update an observance (Admin) |
| `/api/events/:id` | `DELETE` | Delete an observance (Admin) |
| `/api/subscribers` | `POST` | Subscribe to email alerts (Work/Business/Personal, lead times, consent) |
| `/api/subscribers/manage` | `GET` | Look up subscription by token or email |
| `/api/subscribers/:id` | `PUT` | Update subscription preferences |
| `/api/subscribers/unsubscribe`| `POST` | 1-click unsubscribe |
| `/api/subscribers` | `GET` | Subscriber directory and segmentation analytics (Admin) |
| `/api/alerts/run` | `POST` | Trigger alert cycle for today or simulated date (`simulated_date`) |
| `/api/alerts/logs` | `GET` | View deduplication dispatch logs |
| `/api/outbox` | `GET` | View rendered HTML emails in outbox inspector |
| `/api/lunar` | `GET` | Get Islamic moon-sighting configurations |
| `/api/lunar/override` | `POST` | Set NSCIA/Sultanate moon-sighting override |
| `/api/system/status` | `GET` | System health, metrics, and scheduler status |

---

## 📁 Project Structure

```
calendar-teh/
├── data/
│   ├── events.json           # Comprehensive seed events registry
│   ├── lunar_overrides.json  # Astronomical & NSCIA moon-sighting dates
│   ├── subscribers.json      # Subscriber records & segmentations
│   ├── notifications.json    # Deduplication logs
│   └── outbox.json           # Generated email alerts outbox
├── services/
│   ├── dateService.js        # Easter algorithm, lunar resolution & event expansion
│   ├── storageService.js     # Atomic JSON file storage
│   ├── emailService.js       # Multi-provider email dispatch & HTML templates
│   ├── alertEngine.js        # Alert matching & deduplication engine
│   └── scheduler.js          # node-cron daily alert background runner
├── public/
│   ├── index.html            # Main calendar SPA layout & accessible markup
│   ├── css/
│   │   ├── variables.css     # Nigerian/African palette & theme tokens
│   │   ├── patterns.css      # Ankara & geometric SVG patterns
│   │   ├── main.css          # Core typography, hero, and navigation
│   │   ├── calendar.css      # Month grid, Year view & Agenda styling
│   │   ├── modals.css        # Event details, signup form & preference modals
│   │   └── admin.css         # Admin portal & email outbox inspector styling
│   └── js/
│       ├── api.js            # Frontend REST API client
│       ├── confetti.js       # Celebratory canvas confetti flourish
│       ├── calendar.js       # Calendar views rendering engine & .ics export
│       ├── modals.js         # Modals & form submission handler
│       ├── admin.js          # Admin hub, lunar override & alert simulator
│       └── app.js            # App orchestrator, theme & route controller
├── server.js                 # Express server & API endpoints
├── package.json
└── README.md
```
