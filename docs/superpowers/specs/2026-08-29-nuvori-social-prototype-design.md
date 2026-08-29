# Nuvori Social Prototype Design

**Date:** 2026-08-29  
**Status:** Design approved in chat; awaiting written-spec review  
**Scope:** Prototype for the individual activity loop with a minimal social session

## 1. Goal and Decision

The prototype will test whether a user who completes (or adapts) a small activity starts another session within seven days. It includes a minimal social layer from the beginning: authenticated invitations and a synchronized timer.

The recommended architecture is **Supabase-first**:

- Expo/React Native for the mobile app;
- Supabase Auth for identity;
- Supabase Postgres for durable state;
- Supabase Realtime for session state and presence;
- Node.js + TypeScript API for authoritative session commands, validation, and rewards.

Audio, chat, GPS, steps, calories, and automatic host transfer are outside this prototype.

## 2. Product Rules

- The host is the sole authority for starting, pausing, resuming, and ending a social session.
- Both users must have Nuvori accounts. The host creates an invite link or code; the participant joins with their own account.
- If the host disappears, the session waits 60 seconds and then ends for everyone without a reward.
- A short session is valid. An early exit selected through **Hoje está difícil** is recorded as `adapted`, not as failure. `normal` and `adapted` endings receive a capsule; `interrupted` and `cancelled` endings are recorded for learning but do not receive one.
- Rewards are guaranteed for valid sessions and are granted by the server, never chosen by the client.
- Check-in data (energy, resistance, mood) and personal outcomes are private to their owner.
- There is no punitive streak or progress loss after absence.

## 3. Components and Boundaries

### Mobile app (Expo/React Native)

Owns presentation and local interaction across Home, Mission, Session, Collection, and Profile. It renders the timer from server timestamps, queues individual offline completions, and displays the reward returned by the API. It cannot decide reward contents or mutate protected session state directly.

### Supabase Auth

Provides account creation, login, and the authenticated identity used by every session and API request.

### Supabase Postgres

Stores profiles, sessions, membership, check-ins, outcomes, rewards, collection state, and analytics events. Row-level security prevents participants from reading another user's private fields.

### Supabase Realtime

Publishes the shared session state, membership changes, host commands, and presence on a session-scoped channel. Emotional and check-in fields are excluded from the channel payload.

### Node.js/TypeScript API

Validates membership and host authority, creates and joins sessions, writes lifecycle transitions, calculates rewards, enforces idempotency, and performs recovery jobs. Sensitive writes use a server-side database credential.

## 4. Session Flow

1. The host completes a check-in, chooses 5, 10, 15, or 20 minutes, and creates a session.
2. The API creates a pending session and stores a hash of the invite token. The original token exists only in the invite link or displayed code.
3. The authenticated participant accepts the invite. The API adds them to `session_members`.
4. Both clients subscribe to `session:{id}` through Realtime.
5. The host starts the session. The API validates the state and writes `started_at` and `planned_seconds`.
6. Clients derive remaining time from `started_at`, planned duration, accumulated pauses, and the latest server time. The local countdown is display-only.
7. The host may pause, resume, or end. Each command is authenticated, validated, and persisted before being broadcast.
8. On end, the API records `normal`, `adapted`, or `interrupted` outcomes per participant as appropriate. It grants one reward for each `normal` or `adapted` outcome in the same logical operation; `interrupted` and `cancelled` outcomes receive no capsule.
9. The app shows the guaranteed capsule and the item returned by the API.

## 5. Data Model

- `profiles`: public display name, avatar, and account metadata.
- `sessions`: host, planned duration, status, lifecycle timestamps, accumulated pause time, host presence deadline, and invite expiry.
- `session_members`: session/user membership and role (`host` or `participant`).
- `session_checkins`: private energy, resistance, and optional mood for each member.
- `session_outcomes`: realized duration, pleasure during, state after, and outcome type.
- `reward_grants`: capsule and item granted, idempotency key, and grant timestamp.
- `collection_items`: creatures, essence, skins, and other owned content.
- `analytics_events`: invite accepted, session started, session ended, return session started, and operational failures.

The API is the only writer for protected lifecycle fields and rewards. Repeated end requests reuse the same idempotency key and return the original grant instead of creating a duplicate.

## 6. Failure and Offline Behavior

### Individual sessions

The timer works without a connection. Completion is stored locally as pending synchronization. On reconnect, the API validates the payload, records the outcome, and grants the reward once.

### Social sessions

Both members need connectivity to create, join, and start. A brief disconnect does not stop the visual timer; clients continue from their last authoritative timestamps. On reconnect, the client fetches the current session and replaces local state with the server state.

If the host has no presence for 60 seconds, a server task marks the session `cancelled`. A participant who disconnects may rejoin while the session remains active; a missed portion may produce an `interrupted` outcome.

If reward creation fails after a valid end, the session enters `reward_pending`. A recovery task retries the transaction using the same idempotency key.

## 7. Privacy and Security

- Participants can see only public profile data, membership, and shared session state.
- Check-in, mood, resistance, personal outcomes, and insights remain private.
- Invite tokens are stored hashed and expire.
- The client never chooses rarity, creature, essence, evolution, or any other economy result.
- Every protected command checks the authenticated user, role, session status, and allowed transition.

## 8. Testing and Instrumentation

### Tests

- Unit tests for state transitions, timer math, pauses, adaptation, and reward idempotency.
- Integration tests for authenticated invitation, participant join, host-only commands, reconnection, and host timeout.
- End-to-end test with two users: invite, join, synchronized start, pause, resume, end, and capsule display.
- Offline tests for an individual session queued and synchronized later, plus social cancellation after host absence.
- Authorization tests confirming that private check-in fields cannot be read by the other participant.

### Product events

Record invite created/accepted, session started, normal/adapted/interrupted end, reward failure, and every new session start. The primary measure is the share of users who start a new session within seven days of their first valid session. An interrupted new session counts as a return; individual and social sessions are reported separately.

## 9. Prototype Acceptance Criteria

The prototype is ready for a small user test when:

- two authenticated users can complete the social flow without manual database changes;
- both timers remain aligned after a brief reconnect;
- only the host can mutate shared lifecycle state;
- a host timeout cancels the session after the configured tolerance;
- valid (`normal` or `adapted`) endings produce exactly one capsule per eligible participant, while `interrupted` and `cancelled` endings produce none;
- individual sessions can complete offline and synchronize later;
- private check-in fields are not exposed to the other participant;
- the seven-day return event is emitted for a newly started session, including an interrupted one.

## 10. Deliberate Non-Goals

The prototype does not include accountless guests, host promotion, voice/video, chat, location tracking, activity metrics, battle mechanics, paid content, random purchases, or season-pass functionality. These can be evaluated after the core return signal is observed.
