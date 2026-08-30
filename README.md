# Nuvori visual prototype

Nuvori is a browser-first prototype for the authenticated Home and first-start loop. It uses React, Vite, a local reducer for presentation state, and Supabase for identity, shared sessions, and Realtime synchronization when the public client variables are configured.

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

The invite sheet supports both a local simulation and the remote Supabase path. In remote mode the host creates a real session and receives a shareable URL containing the session and invite token. A second authenticated account can join with that URL; the host remains the only account allowed to start, pause, resume, or end the session.

## Backend foundation

`src/services/sessionRepository.ts` is a deterministic in-memory adapter for the first social contract: a host creates an invite-backed session, one participant joins, the host starts and ends it, and a valid ending grants one reward per member. It deliberately uses the same lifecycle rules that the future API must enforce, including host-only mutations, timestamp-gated normal completion, and idempotent repeated end requests.

`src/services/retention.ts` keeps the seven-day return rule explicit: the future API should emit a return event when a later session starts within seven days of the first session, even if that new session is later interrupted.

The Supabase migration at `supabase/migrations/0001_nuvori_sessions.sql` creates profiles, sessions, membership, private check-ins and outcomes, idempotent rewards, analytics events, indexes, and baseline row-level security. It includes the server timestamps and pause/presence fields needed for a synchronized social timer.

After creating the Supabase project:

1. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` plus `VITE_SUPABASE_PUBLISHABLE_KEY` (or the legacy `VITE_SUPABASE_ANON_KEY`).
2. Apply the migration with the Supabase CLI (`supabase db push`) or the SQL editor.
3. Keep the service-role key on the future Node.js API only; never expose it in the Vite client.

`src/lib/supabase.ts` now initializes the official client only when those public variables are present. Until they are configured, the UI remains fully runnable with the local adapter and no network credentials.

`src/services/profileService.ts` creates or updates the signed-in user's public profile on authentication. `src/services/inviteLink.ts` centralizes invite URL creation and parsing. The Android shell registers the `nuvori://session?...` scheme and forwards incoming links to the same join flow used by the browser.

Authenticated solo sessions use the `create_solo_session` and `start_solo_session` RPCs from migration `0004_solo_session_commands.sql`. The check-in is written to `session_checkins` before the server starts the timer; ending the session uses the same outcome, reward, and seven-day return rules as social sessions.

The active view exposes Realtime connection state. Channel errors, timeouts, and closed subscriptions are retried with exponential backoff (up to ten seconds), and a fresh `session_snapshot` is requested whenever the channel reconnects.

For passwordless email authentication, add the local and deployed app URLs to Supabase Auth's URL configuration (for example `http://localhost:5173`, your deployed HTTPS origin, and the app's HTTPS callback URL). The client never receives a service-role key.

## Two-account smoke test

1. Open the app in two browser profiles or on two devices and authenticate with different email accounts.
2. On account A, complete check-in and choose **Convidar alguém**. Copy the generated link.
3. Open the link while signed in as account B. Account B should appear in the invite sheet without changing the host role.
4. Start the session from account A. Both clients should enter the active view and show the same server-backed clock.
5. Pause, resume, and end from account A, checking that account B follows the Realtime updates. Repeat an interrupted end and verify no capsule is granted.

On Android, install the debug APK and open the invite link with the `nuvori://session` scheme. The same join callback is used when the app is already open or launched from a cold start.

## Deliberate non-goals

The prototype does not yet include a production API boundary, offline conflict resolution, host timeout recovery, push notifications, GPS, fitness metrics, streaks, a profile editing surface, or a production reward inventory. Email delivery and redirect configuration still depend on the Supabase project settings. The local adapter remains available for deterministic UI tests.

## Integration boundary

The next implementation boundary is production hardening: add explicit loading/error recovery for expired invites and dropped Realtime channels, expose profile editing, and move reward and retention analytics behind server-side policies. Keep the current presentational components and state names as the UI contract while those adapters mature.
