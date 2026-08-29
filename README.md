# Nuvori visual prototype

Nuvori is a browser-only visual prototype for the authenticated Home and first-start loop. It uses React, Vite, and local reducer state; there is no account, persistence, network, or backend service.

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

## Prototype state model

The Home reducer moves through `rest`, `checkin`, `invite`, `active`, `capsule`, and `return`. Check-in values, recommended duration, per-session line progress, persistent Muru stage, social participation, pause state, and the session outcome exist only in in-memory React state and reset on reload. Normal completion is gated by the timestamp-derived clock; adapted and interrupted endings remain explicit early exits. Normal and adapted sessions show a capsule, while interrupted sessions return without a reward.

The invite sheet includes a local host-side simulation of an authenticated participant joining. It displays only a fixed public name and avatar, keeps the inviter as host, and does not perform authentication or networking.

## Deliberate non-goals

This prototype does not implement authentication, Supabase persistence, real-time social sessions, invitations delivered through a service, analytics, notifications, offline sync, GPS, fitness metrics, streaks, or a production reward inventory.

## Integration boundary

The next implementation boundary is the social prototype specification: replace the local reducer transitions with Supabase Auth for identity, Supabase-backed session and capsule records, and API/realtime coordination for invite and participant state. Keep the current presentational components and state names as the UI contract while those adapters are introduced.
