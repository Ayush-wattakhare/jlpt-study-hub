# 🎌 JLPT N5 Study Hub
### Ayush's Personal Japanese Learning App — with SMS Reminders

A full-stack Node.js web application to track your JLPT N5 preparation. Study vocabulary, grammar, and kanji — and get real SMS reminders to your phone via **Twilio**.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Dashboard** | Daily task, streak counter, live progress stats, activity calendar |
| **Vocabulary** | 48 N5 vocab cards, filterable by category (numbers, verbs, etc.) |
| **Grammar** | All 13 core N5 grammar patterns with Japanese examples |
| **Kanji** | 44 N5 kanji, tap to mark learned, filterable by group |
| **Flashcards** | Flip-card quiz with Know / Again scoring |
| **Tracker** | Milestone checklists for all 4 phases with progress bars |
| **SMS Reminders** | Real SMS alerts via Twilio to your registered mobile number |
| **Daily Motivation** | Automatic 8 AM motivational SMS every day |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18 or above → [Download](https://nodejs.org)
- **npm** (comes with Node.js)

### 2. Install dependencies
```bash
cd jlpt-n5-app
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Open `.env` and fill in your values (see SMS Setup below for Twilio keys).

### 4. Start the server
```bash
npm start
```
Open your browser at **http://localhost:3000** 🎉

For development with auto-restart:
```bash
npm run dev
```

---

## 📱 SMS Setup (Twilio)

To receive real SMS reminders on your phone, you need a **free Twilio account**.

### Step 1 — Create Twilio account
1. Go to [https://www.twilio.com](https://www.twilio.com) and sign up for free
2. The free trial gives you **$15.50 credits** (~150+ SMS messages)
3. Verify your phone number during signup

### Step 2 — Get your credentials
1. Go to [Twilio Console](https://console.twilio.com)
2. On the dashboard, copy:
   - **Account SID** (starts with `AC...`)
   - **Auth Token**
3. Go to **Phone Numbers → Manage → Active numbers**
4. Copy your **Twilio phone number** (e.g. `+12345678900`)

### Step 3 — Fill in `.env`
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx      # Your Twilio number
YOUR_PHONE_NUMBER=+91XXXXXXXXXX       # Your personal mobile (India = +91...)
```

### Step 4 — Register number in the app
1. Open the app → go to **Reminders** tab
2. Enter your mobile number in the format `+91XXXXXXXXXX`
3. Click **Save number**
4. Click **Send test SMS** to verify it works!

> **⚠️ Free Trial Note:** On Twilio free trial, you can only send SMS to **verified numbers**. Go to Twilio Console → Phone Numbers → Verified Caller IDs to add your number.

---

## 🌐 Deploy Online (Free)

### Option A — Render (Recommended, Free tier)

1. Push your code to a GitHub repository
2. Go to [https://render.com](https://render.com) and sign in with GitHub
3. Click **New → Web Service**
4. Select your repository
5. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. Add environment variables (same as your `.env` file) in the Render dashboard
7. Click **Deploy** — your app will be live at `https://your-app.onrender.com`

### Option B — Railway (Very easy)

1. Go to [https://railway.app](https://railway.app)
2. Click **New Project → Deploy from GitHub**
3. Select your repo
4. Add environment variables in the Variables tab
5. Done — live in ~2 minutes!

### Option C — Run locally, access from phone (ngrok)

If you just want to test from your phone on the same WiFi:
```bash
npm install -g ngrok
npm start            # in terminal 1
ngrok http 3000      # in terminal 2
```
Use the `https://xxxx.ngrok.io` URL on your phone.

---

## 🗂 Project Structure

```
jlpt-n5-app/
├── server.js          # Express server + Twilio SMS + cron scheduler
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── .env               # Your actual env (DO NOT commit this!)
├── public/
│   └── index.html     # Full frontend (SPA — all in one file)
└── README.md          # This file
```

---

## ⏰ SMS Reminder Schedule

The app sends SMS at these default times (all configurable in the Reminders tab):

| Time | Reminder |
|---|---|
| **7:00 AM** | Morning flashcards |
| **7:15 AM** | New vocab / grammar session |
| **1:00 PM** | Afternoon writing drill |
| **9:00 PM** | Evening review & quiz |
| **8:00 AM** | Daily motivation (automatic, every day) |

You can add, edit, enable/disable, or delete reminders from the app UI.

---

## 📚 Study Plan Summary

| Phase | Days | Focus |
|---|---|---|
| Phase 1 | Days 1–7 | Core vocabulary (150 words) |
| Phase 2 | Days 8–16 | Grammar foundations (13 patterns) |
| Phase 3 | Days 17–21 | Kanji basics (80 N5 kanji) |
| Phase 4 | Days 22–28 | Reading, listening & mock tests |

> Since Ayush already knows hiragana + katakana, the plan starts directly from vocabulary.

---

## 🔧 Customization

### Add more vocabulary
Edit the `VOCAB` array in `public/index.html`:
```javascript
{jp:'新幹線', read:'しんかんせん', en:'bullet train', cat:'nouns'},
```

### Change reminder messages
Edit the `DEFAULT_REMINDERS` array in `server.js`, or use the app UI.

### Change motivational messages
Edit the `motivations` array in the daily 8 AM cron job in `server.js`.

---

## 🛠 Tech Stack

- **Backend:** Node.js + Express
- **SMS:** Twilio API
- **Scheduling:** node-cron
- **Frontend:** Vanilla HTML/CSS/JS (no framework needed)
- **Fonts:** Google Fonts (DM Serif Display, Noto Sans JP, DM Mono)
- **Storage:** In-memory (server) + API sync

> **Note on persistence:** The server uses in-memory state, which resets on restart. For permanent persistence, replace `appState` in `server.js` with a SQLite or MongoDB database. Progress is synced to the server on each action.

---

## 📝 License

Personal use — built for Ayush Wattakhare's JLPT N5 preparation.

---

**がんばれ、Ayush！ You've got this. 🎌**
