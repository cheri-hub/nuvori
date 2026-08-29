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

The Home reducer moves through `rest`, `checkin`, `invite`, `active`, `capsule`, and `return`. Check-in values, duration, line progress, social participation, pause state, and the session outcome exist only in in-memory React state and reset on reload. Normal and adapted sessions show a capsule; interrupted sessions return without a reward.

## Deliberate non-goals

This prototype does not implement authentication, Supabase persistence, real-time social sessions, invitations delivered through a service, analytics, notifications, offline sync, GPS, fitness metrics, streaks, or a production reward inventory.

## Integration boundary

The next implementation boundary is the social prototype specification: replace the local reducer transitions with Supabase Auth for identity, Supabase-backed session and capsule records, and API/realtime coordination for invite and participant state. Keep the current presentational components and state names as the UI contract while those adapters are introduced.
