# 🚀 MSR Next Gen Tracker & Maya AGI Operations Suite

Mobile-friendly Progressive Web App (PWA) built for **MSR Next Gen** digital marketing agency in Gorakhpur (GKP), India. Powered by **Vite + React + Tailwind CSS**, **Firebase Phone Auth**, **Supabase PostgreSQL Database**, **Groq Llama 3.3 Free API**, and an **Evolutionary Multi-Agent A2A Mesh Network (Maya AGI)**.

---

## 🌟 Key Features

1. **🧠 Autonomous Multi-Agent A2A Mesh (LangGraph-inspired)**:
   - **Maya Ops Director**: Daily target tracking (10 leads/day, calling queue, video pipeline, gym visits).
   - **Maya HR & Morale Coach**: Geofence attendance audits, burnout prevention, daily streak celebrations.
   - **Maya Finance Sage**: 100% transparent 8% growth pool calculation, GPS deal audits, UPI payroll reconciliation.
   - **Maya Performance Mentor**: Weekly Hinglish executive briefings.
   - **Adaptive Evolution Engine**: Agents earn XP and Level Up as real agency operations flow through the app.

2. **📍 200m GKP Office Geofenced GPS Attendance**:
   - Gorakhpur office radius check (`26.7606, 83.3732`) for office staff.
   - GPS coordinate proof automatically tagged to Field Executive gym visits.

3. **💸 Manual UPI 1-Tap Salary Settlements**:
   - No auto bank deductions — Owner manually pays with 1-tap via **PhonePe, Google Pay, Paytm, or BHIM** (`upi://pay`).
   - 100% transparent ledger with 8% growth pool 3-way split and deal commissions.

4. **⚡ E-Commerce & Logistics Automations**:
   - **Shopify Webhook**: New Amparo orders auto-ingest into calling queue.
   - **Shiprocket Status Sync**: "RTO Initiated" packages auto-flag as **Urgent RTO** in bright red at top of queue.

5. **📱 Mobile-First PWA Design**:
   - Installable on Android & iOS home screens.
   - 48px+ big touch targets, Hinglish interface copy, works offline with rich fallback demo mode.

---

## 🛠️ Beginner's Setup Guide (Step-by-Step)

### Step 1: Run Locally on your PC
```bash
# 1. Open folder in VS Code or Terminal
cd "Msr Next Gen"

# 2. Start local development server
npm run dev
```
Open the URL shown in terminal (usually `http://localhost:5173`) in your phone or browser.

---

### Step 2: Deploy Free on Netlify (1-Click)
1. Push this folder to your GitHub repository (`github.com/your-username/msr-next-gen-tracker`).
2. Go to [Netlify.com](https://www.netlify.com) and log in.
3. Click **"Add new site"** ➔ **"Import an existing project"** ➔ Select your GitHub repo.
4. Build Settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **"Deploy Site"** — Your PWA is live in 60 seconds! 🚀

---

### Step 3: Get Free API Keys (Groq & OpenRouter)

#### A. Free Groq API Key (Recommended for Super-Fast Llama 3.3 70B)
1. Go to [https://console.groq.com/keys](https://console.groq.com/keys).
2. Sign in with Google.
3. Click **"Create API Key"**, copy your key (starts with `gsk_...`).
4. You can paste it directly inside the app in **Maya A2A Hub** tab or in `.env` as `VITE_GROQ_API_KEY=gsk_...`.

#### B. Free OpenRouter API Key
1. Go to [https://openrouter.ai/keys](https://openrouter.ai/keys).
2. Sign in and generate a free key (`sk-or-v1-...`).
3. Add to `.env`: `VITE_OPENROUTER_API_KEY=sk-or-v1-...`.

---

### Step 4: Supabase PostgreSQL Database Setup
1. Create a free account at [https://supabase.com](https://supabase.com).
2. Create a new project named `msr-next-gen`.
3. Go to **SQL Editor** in Supabase sidebar.
4. Copy all contents from [`supabase/migrations/001_initial_schema.sql`](file:///supabase/migrations/001_initial_schema.sql) and paste into the SQL Editor, then click **Run**.
5. Copy your **Project URL** and **Anon Public Key** from *Project Settings ➔ API* and paste in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

---

### Step 5: Firebase Phone OTP Setup (Free Tier)
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com).
2. Create a new project `msr-next-gen`.
3. Go to **Build ➔ Authentication ➔ Sign-in method ➔ Phone** and click **Enable**.
4. (Optional) Add Test Phone Numbers (e.g. `+919876543210` with OTP `123456`) for instant free testing.
5. Go to **Project Settings** ➔ Web App (</>) ➔ Copy configuration into `.env`.

---

### Step 6: Future Maya AGI Bridge Integration
This app includes `src/services/mayaAgiBridge.js`. When your future **Maya AGI** central system is ready:
1. Set `VITE_MAYA_AGI_ENDPOINT=https://your-maya-agi.com`
2. Set `VITE_MAYA_AGI_KEY=your_token`
3. The PWA will automatically start streaming all team events, attendance signals, and deal updates to your central Maya AGI!

---

## 👥 Role Matrix

| Role | Responsibility | Special Tools |
|---|---|---|
| **Content Calling** (`content_calling`) | Amparo call queue & Urgent RTO rescue | Tap-to-call, RTO Saved (+₹50), MSR Lead Hand-off |
| **Video Editor & Leads** (`editor_leads`) | 10 Leads/day research & Video creation | "X/10 Today" Quota Tracker, Reels/Shorts Pipeline |
| **Field Executive** (`field_executive`) | Gorakhpur Gym visits & MSR meetings | 1-Tap GPS proof tag, Silajit stock ledger |
| **Agency Owner** (`owner`) | Full command, attendance audit, financials | 8% Growth pool, 1-Tap UPI Salary Payouts, Groq AI Brief |
