# Nuvori visual prototype

Nuvori is a browser-first prototype for the authenticated Home and first-start loop. It uses React, Vite, and local reducer state in the UI, with a Supabase-ready session contract that can be connected after the project is provisioned.

## Local review

```bash
npm install
npm run dev -- --host 0.0.0.0
```

The app is served at the Vite URL shown in the terminal. Verification commands:

```bash
npm test
npm run build
```

## Android APK

The Android shell is generated with Capacitor and lives in `android/`. To rebuild a debug APK after changing the web app:

```bash
npm run mobile:sync
cd android
./gradlew assembleDebug       # macOS/Linux
.\gradlew.bat assembleDebug   # Windows PowerShell
```

The output is `android/app/build/outputs/apk/debug/app-debug.apk`. Install it on a USB-debug-enabled Android phone with `adb install -r <path-to-apk>` or copy the file to the phone and open it there. This is a debug build; signing and Play Store packaging are still pending.

## Prototype state model

The Home reducer moves through `rest`, `checkin`, `invite`, `active`, `capsule`, and `return`. Check-in values, recommended duration, per-session line progress, persistent Muru stage, social participation, pause state, and the session outcome exist only in in-memory React state and reset on reload. Normal completion is gated by the timestamp-derived clock; adapted and interrupted endings remain explicit early exits. Normal and adapted sessions show a capsule, while interrupted sessions return without a reward.

The invite sheet includes a local host-side simulation of an authenticated participant joining. It displays only a fixed public name and avatar, keeps the inviter as host, and does not perform authentication or networking.

## Backend foundation

`src/services/sessionRepository.ts` is a deterministic in-memory adapter for the first social contract: a host creates an invite-backed session, one participant joins, the host starts and ends it, and a valid ending grants one reward per member. It deliberately uses the same lifecycle rules that the future API must enforce, including host-only mutations, timestamp-gated normal completion, and idempotent repeated end requests.

`src/services/retention.ts` keeps the seven-day return rule explicit: the future API should emit a return event when a later session starts within seven days of the first session, even if that new session is later interrupted.

The Supabase migration at `supabase/migrations/0001_nuvori_sessions.sql` creates profiles, sessions, membership, private check-ins and outcomes, idempotent rewards, analytics events, indexes, and baseline row-level security. It includes the server timestamps and pause/presence fields needed for a synchronized social timer.

After creating the Supabase project:

1. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` plus `VITE_SUPABASE_PUBLISHABLE_KEY` (or the legacy `VITE_SUPABASE_ANON_KEY`).
2. Apply the migration with the Supabase CLI (`supabase db push`) or the SQL editor.
3. Keep the service-role key on the future Node.js API only; never expose it in the Vite client.

`src/lib/supabase.ts` now initializes the official client only when those public variables are present. Until they are configured, the UI remains fully runnable with the local adapter and no network credentials.

## Deliberate non-goals

The browser prototype does not yet implement authentication, Supabase client wiring, real-time channel subscriptions, invitations delivered through a service, notifications, offline sync, GPS, fitness metrics, streaks, or a production reward inventory. The migration and repository contract define that next integration boundary without pretending those services are already live.

## Integration boundary

The next implementation boundary is the social prototype specification: replace the local reducer transitions with Supabase Auth for identity, Supabase-backed session and capsule records, and API/realtime coordination for invite and participant state. Keep the current presentational components and state names as the UI contract while those adapters are introduced.
