# Triplan 🗺️

A mobile-first trip planning PWA. Built with React + Vite, Supabase (auth + DB + storage), and MapLibre GL JS with OpenFreeMap tiles (no API key needed).

---

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. That's it for configuration
- Supabase is already configured (project: `triplan`, EU Frankfurt)
- Map tiles via OpenFreeMap — **no API key, no credit card needed**

---

## Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) on your phone or browser.

**To test on your phone:** Make sure your phone and laptop are on the same WiFi, then visit `http://YOUR_LAPTOP_IP:5173` on your phone.

---

## Deploy to Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Then follow the prompts. Your app will be live at `https://triplan-xxx.vercel.app`.

After deploying, go to your **Supabase Dashboard → Authentication → URL Configuration** and add your Vercel URL to:
- Site URL
- Redirect URLs

---

## Install as PWA on iPhone
1. Open your deployed URL in Safari
2. Tap the Share button → "Add to Home Screen"
3. It launches full-screen like a native app ✅

---

## Project Structure
```
src/
  lib/
    supabase.js        ← Supabase client + map tile URL
  hooks/
    useAuth.jsx        ← Auth context (login, signup, session)
  components/
    Icon.jsx           ← SVG icon set
    TripMap.jsx        ← MapLibre map with pins + route line
    BottomSheet.jsx    ← Reusable slide-up sheet
    NewTripModal.jsx   ← Create new trip
    NewDayModal.jsx    ← Add day to trip
    NewStopModal.jsx   ← Add stop to day
  pages/
    AuthPage.jsx       ← Login / signup
    HomePage.jsx       ← Trip list + new trip FAB
    TripDetailPage.jsx ← Map + day itinerary
    JoinPage.jsx       ← Handle invite link
```

---

## Features
- ✅ Auth (email/password via Supabase)
- ✅ Create trips with emoji, dates, destination
- ✅ Interactive map with numbered pins + dashed route line
- ✅ Filter map by day
- ✅ Day-by-day itinerary with stops
- ✅ Check off stops as done (with progress bar)
- ✅ Physical & logistics notes per day
- ✅ Photo upload per day (stored in Supabase Storage)
- ✅ Collaborative — invite link based, token-secured
- ✅ PWA — installable on iPhone/Android

---

## Database (already set up on Supabase)
- `profiles` — user profiles
- `trips` — trips with invite tokens
- `trip_members` — who has access (join via invite token)
- `trip_days` — days within a trip
- `stops` — individual stops per day (with lat/lng for map)
- `trip_photos` — photos per day (files in Supabase Storage)
