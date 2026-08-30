# Nuvori Supabase Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the existing Nuvori flow to Supabase Auth, protected session commands, and Realtime while preserving local mode.

**Architecture:** Add one additive SQL migration for authoritative RPC commands and Realtime publication. Add focused TypeScript services and hooks that map Supabase identity/session state into the existing reducer contract; keep the reducer as a local fallback when public env is absent.

**Tech Stack:** React, TypeScript, Vitest, Supabase JS v2, Supabase Postgres RPC, Supabase Realtime, Capacitor Android.

**Spec:** `docs/superpowers/specs/2026-08-30-nuvori-supabase-integration-design.md`

## Global Constraints

- Host is the sole authority for social lifecycle commands.
- Normal and adapted endings receive one reward per eligible member; interrupted and cancelled endings receive none.
- A later session started within seven days is a return even if it is later interrupted.
- Check-ins, mood, resistance, outcomes, and rewards are private; only shared lifecycle data uses Realtime.
- Missing public Supabase env must keep the local prototype functional.
- Service-role credentials never enter Vite env, the APK, or the client bundle.

---

### Task 1: Add Authoritative Supabase RPC Migration

**Files:**
- Create: `supabase/migrations/0002_social_session_commands.sql`
- Test: `src/services/supabaseMigration.test.ts`

**Interfaces:**
- Produces RPCs `create_social_session`, `join_social_session`, `start_social_session`, `pause_social_session`, `resume_social_session`, and `end_social_session`.
- Each RPC runs as `security definer`, uses `auth.uid()`, and returns the updated public session row where useful.

- [ ] **Step 1: Write the failing migration contract test**

Assert the migration text contains every RPC name, host-only guard, invite expiry check, reward idempotency clause, return event name, and Realtime publication table.

- [ ] **Step 2: Run the test to verify it fails**

Run `npm test -- src/services/supabaseMigration.test.ts`; expect failure because `0002_social_session_commands.sql` does not exist.

- [ ] **Step 3: Write the migration**

Implement transactional functions over the existing `sessions`, `session_members`, `session_outcomes`, `reward_grants`, and `analytics_events` tables. `create_social_session` inserts the host member and emits `invite_created`; `join_social_session` hashes/compares the invite token and inserts one participant; `start_social_session` requires the host and two members, sets `started_at`, and emits `session_started` plus `return_session_started` when the caller has a prior session start in the seven-day window; pause/resume update server timestamps and accumulated pause seconds; `end_social_session` validates host, normal duration, writes outcomes, updates status, and inserts rewards with `on conflict do nothing`.

Add a guarded publication block for `public.sessions` and `public.session_members`.

- [ ] **Step 4: Run the migration contract test**

Run `npm test -- src/services/supabaseMigration.test.ts`; expect PASS.

- [ ] **Step 5: Apply and inspect remotely**

Run `supabase db push` and `supabase migration list`; expect `0002` local and remote.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/0002_social_session_commands.sql src/services/supabaseMigration.test.ts
git commit -m "feat: add Supabase social session commands"
```

### Task 2: Add Auth Service and Gate

**Files:**
- Create: `src/services/authService.ts`
- Create: `src/hooks/useSupabaseAuth.ts`
- Create: `src/components/AuthGate.tsx`
- Create: `src/services/authService.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles/home.css`

**Interfaces:**
- `requestMagicLink(email: string): Promise<void>`
- `useSupabaseAuth(): { user, loading, configured, error, requestMagicLink, signOut }`
- `AuthGate` renders children only after an authenticated session or local mode.

- [ ] **Step 1: Write failing Auth service tests**

Cover trimmed email validation, missing Supabase client fallback, and successful `signInWithOtp` options.

- [ ] **Step 2: Run tests to verify RED**

Run `npm test -- src/services/authService.test.ts`; expect missing module failures.

- [ ] **Step 3: Implement Auth service and hook**

Use the existing optional `supabase` export. Subscribe with `onAuthStateChange`, call `getSession` once, unsubscribe on unmount, and map errors without exposing keys.

- [ ] **Step 4: Implement AuthGate**

Render a small email form and “link sent” confirmation only when configured and unauthenticated. Keep a local-mode pass-through when `isSupabaseConfigured` is false.

- [ ] **Step 5: Wrap App and style the gate**

Wrap the current Home render in `AuthGate`; preserve the existing visual hierarchy and accessible labels.

- [ ] **Step 6: Run targeted and full tests**

Run `npm test -- src/services/authService.test.ts` then `npm test`; expect all tests green.

- [ ] **Step 7: Commit**

```bash
git add src/services/authService.ts src/services/authService.test.ts src/hooks/useSupabaseAuth.ts src/components/AuthGate.tsx src/App.tsx src/styles/home.css
git commit -m "feat: add Supabase magic-link auth gate"
```

### Task 3: Add Remote Session Adapter and Realtime

**Files:**
- Create: `src/services/supabaseSessionService.ts`
- Create: `src/services/supabaseSessionService.test.ts`
- Create: `src/hooks/useRemoteSession.ts`
- Modify: `src/state/homeReducer.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- `createRemoteSession(input): Promise<SessionSnapshot>`
- `joinRemoteSession(input): Promise<SessionSnapshot>`
- `startRemoteSession(sessionId): Promise<SessionSnapshot>`
- `pauseRemoteSession(sessionId): Promise<SessionSnapshot>`
- `resumeRemoteSession(sessionId): Promise<SessionSnapshot>`
- `endRemoteSession(input): Promise<SessionSnapshot>`
- `subscribeToRemoteSession(sessionId, onSnapshot): () => void`

- [ ] **Step 1: Write failing adapter tests**

Assert RPC names and payloads, row mapping, stable error conversion, and that the Realtime unsubscribe calls `channel.unsubscribe()`.

- [ ] **Step 2: Run tests to verify RED**

Run `npm test -- src/services/supabaseSessionService.test.ts`; expect missing module failures.

- [ ] **Step 3: Implement the adapter**

Use `supabase.rpc`, map `sessions` plus `session_members`/`reward_grants` into `SessionSnapshot`, and subscribe to `postgres_changes` for shared session tables. Never include private check-in/outcome fields in the snapshot.

- [ ] **Step 4: Implement remote-session hook**

Track `sessionId`, snapshot, pending command, and error; subscribe only while a social session is active and clean up on id/session changes.

- [ ] **Step 5: Extend reducer state minimally**

Add optional `remoteSessionId` and preserve existing transitions; do not move lifecycle validation into the reducer.

- [ ] **Step 6: Bind invite/start/end actions**

When authenticated, create/join/start/end through the adapter and dispatch local actions only after successful RPC responses. Keep the current simulation path in local mode.

- [ ] **Step 7: Run tests and build**

Run `npm test` and `npm run build`; expect all tests green and a production bundle.

- [ ] **Step 8: Commit**

```bash
git add src/services/supabaseSessionService.ts src/services/supabaseSessionService.test.ts src/hooks/useRemoteSession.ts src/state/homeReducer.ts src/App.tsx
git commit -m "feat: connect social sessions to Supabase Realtime"
```

### Task 4: Configure, Verify, and Rebuild Android

**Files:**
- Modify: `.env.example`
- Modify: `README.md`

- [ ] **Step 1: Configure local public env**

Create ignored `.env.local` from the user-provided project URL and publishable key; never copy database passwords or service-role keys.

- [ ] **Step 2: Apply the migration and run web checks**

Run `supabase db push`, `supabase migration list`, `npm test`, and `npm run build`.

- [ ] **Step 3: Sync and build the debug APK**

Run `npm run mobile:sync`, then from `android/` run `./gradlew assembleDebug` or `gradlew.bat assembleDebug` with the Android Studio JBR and SDK paths.

- [ ] **Step 4: Record verification**

Confirm the APK path, install it with `adb -s <serial> install -r`, and verify `adb shell monkey -p com.nuvori.app 1` launches.

- [ ] **Step 5: Commit and push**

```bash
git add .env.example README.md
git commit -m "docs: document Supabase session integration"
git push origin main
```
