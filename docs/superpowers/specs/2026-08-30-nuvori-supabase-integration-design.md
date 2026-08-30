# Nuvori Supabase Integration Design

**Date:** 2026-08-30  
**Status:** Approved in chat  
**Scope:** Connect the existing browser and Capacitor shell to Supabase Auth, authoritative social sessions, and Realtime while preserving local review mode.

## Goal

An authenticated Nuvori user can enter the existing Home flow, create or join a social session, start and end it through server-validated commands, and receive live session updates on every connected client. When public Supabase variables are absent, the current local prototype remains usable.

## Architecture

The browser owns presentation and a reducer-shaped view model. Supabase Auth owns identity and session persistence. Postgres functions in a new migration own protected session commands and reward idempotency. Supabase Realtime publishes only shared session and membership fields; private check-ins and outcomes remain queryable only by their owner. The client adapter maps database rows to the existing `HomeState` contract and never decides lifecycle validity or reward contents.

## User Flow

1. With Supabase configured and no auth session, show a compact email magic-link gate.
2. After the link is followed, restore the Auth session and render the existing Home.
3. Creating a social invite calls `create_social_session`, receives a session id and public invite token, then subscribes to `session:{id}`.
4. Joining calls `join_social_session` with the token; the host sees the participant through Realtime.
5. Starting, pausing, resuming, and ending call protected RPCs. The timer is derived from server timestamps; Realtime replaces stale local session state.
6. A session start records `session_started` and, when applicable, `return_session_started`. The seven-day predicate is based on start time, so an interrupted session still counts as a return.

## Database Boundary

Migration `0002_social_session_commands.sql` adds:

- RPCs for create, join, start, pause, resume, and end;
- host-only checks and invite expiry validation;
- transactionally idempotent reward grants;
- analytics event emission, including the seven-day return event;
- Realtime publication for shared session and membership tables.

The existing `0001` tables remain the source of truth. The API can later call the same RPCs with a service-role connection without changing the mobile client contract.

## Client Modules

- `src/services/authService.ts`: magic-link request, current session, auth subscription, and sign-out.
- `src/services/supabaseSessionService.ts`: RPC command methods, row mapping, and Realtime subscription cleanup.
- `src/hooks/useSupabaseAuth.ts`: React lifecycle wrapper around Auth.
- `src/components/AuthGate.tsx`: email input, sent-link state, and local-mode fallback.
- `src/hooks/useRemoteSession.ts`: binds one remote session snapshot to the Home view and exposes command status.

The existing reducer remains the local fallback and presentation contract. Remote commands are acknowledged before the local reducer is advanced; incoming Realtime snapshots are authoritative for social sessions.

## Error Handling and Privacy

- Missing or malformed public env means local mode, not a blank screen.
- Auth errors are shown inline and do not log token or key values.
- RPC errors are converted to stable user-facing states; raw Postgres details stay in the console only in development.
- No check-in, mood, resistance, outcome, or reward payload is broadcast over Realtime.
- The client never receives or stores a service-role key.

## Verification

- Unit tests cover env resolution, auth state transitions, RPC payload mapping, Realtime cleanup, and command error mapping.
- SQL is checked for required functions, RLS-sensitive host checks, idempotency constraints, and Realtime publication statements.
- Existing 49 tests remain green; a production web build and debug Android build must continue to pass.

## Non-goals

Email/password registration, push notifications, chat, automatic host transfer, offline social writes, production reward inventory, and Play Store signing remain outside this integration slice.
