# Nuvori Home Visual Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive browser prototype of Nuvori's authenticated Home that validates the first-start loop, Muru's visual presence, the social invite entry point, and the main session states.

**Architecture:** Use a small React + TypeScript + Vite application with local state only. Keep product state transitions in a focused reducer, visual tokens in CSS variables, and presentational components separated by Home state. The prototype is a visual validation surface; it does not implement Supabase, authentication, persistent rewards, or real-time networking.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, plain CSS, local SVG/PNG/WebP assets.

**Spec:** `docs/superpowers/specs/2026-08-29-nuvori-home-visual-design.md`

## Global Constraints

- The first screen is the authenticated Home, not a marketing landing page.
- The primary action is a direct recommendation such as `Comecar 5 min`; the social invite is secondary.
- Use Musgo profundo `#12221E`, Nevoa `#F1EEE4`, Tinta `#1D2926`, Amber-pollen `#E6A24A`, Coral-brasa `#D66A55`, and Mint-sinal `#8CC6B4` as the named color tokens.
- Use Bricolage Grotesque for short display text, Instrument Sans for body and controls, and IBM Plex Mono only for duration/data.
- The signature is the organic first-step line: incomplete at rest, progressively lit during a session, and complete at valid reward.
- Do not add a hero card, streak meter, fitness metrics, gradients, decorative orbs, chat, GPS, calories, or punitive copy.
- The visual prototype must work at 320 px, 390 px, tablet, and desktop widths, with visible focus and reduced-motion behavior.
- Valid session endings are `normal` and `adapted`; `interrupted` is recorded in the prototype but does not show a reward.

---

### Task 1: Scaffold the visual prototype

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces a Vite dev server entry at `src/main.tsx` and a test environment consumed by later component tests.

- [ ] **Step 1: Write the package manifest and scripts**

Include React, React DOM, Vite, TypeScript, Vitest, Testing Library, and jsdom. Add scripts exactly as follows:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 2: Add the application entry and root component**

Render `<App />` into `#root` with `StrictMode`, import `tokens.css` and `global.css`, and keep `App` as the only root-level composition point.

- [ ] **Step 3: Add the design tokens**

Define the six named colors, spacing scale, radii, typography families, focus ring, and mobile content width as CSS custom properties. Do not encode colors directly in component styles.

- [ ] **Step 4: Add global layout and accessibility styles**

Set `box-sizing`, body background, font smoothing, button reset, `:focus-visible`, and `@media (prefers-reduced-motion: reduce)` variables. Ensure the document has no horizontal overflow at 320 px.

- [ ] **Step 5: Configure Vitest and run the scaffold checks**

Run:

```bash
npm install
npm test -- --passWithNoTests
npm run build
```

Expected: the test command exits successfully with no tests, and the production build completes.

- [ ] **Step 6: Commit the scaffold**

```bash
git add package.json index.html src vitest.config.ts
git commit -m "chore: scaffold Nuvori visual prototype"
```

---

### Task 2: Build the Home shell and visual signature

**Files:**
- Create: `src/components/AppHeader.tsx`
- Create: `src/components/BottomNav.tsx`
- Create: `src/components/MuruScene.tsx`
- Create: `src/components/PrimaryAction.tsx`
- Create: `src/components/HomeShell.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/global.css`
- Create: `src/styles/home.css`
- Test: `src/components/HomeShell.test.tsx`

**Interfaces:**
- `MuruScene({ lineProgress: number, mood: "idle" | "walking" | "reward" })` renders Muru and the first-step line.
- `PrimaryAction({ label: string, onClick: () => void })` renders the primary CTA with keyboard focus.
- `HomeShell({ children: ReactNode })` provides header, content column, and bottom navigation without adding a card around the page.

- [ ] **Step 1: Write the failing shell test**

```tsx
it("shows the product, direct start action, and secondary social action", () => {
  render(<App />);
  expect(screen.getByText("NUVORI")).toBeVisible();
  expect(screen.getByRole("button", { name: /Comecar 5 min/i })).toBeVisible();
  expect(screen.getByRole("button", { name: /Convidar alguem/i })).toBeVisible();
});
```

- [ ] **Step 2: Run the shell test to verify it fails**

Run `npm test -- src/components/HomeShell.test.tsx`. Expected: FAIL because the Home shell is not implemented.

- [ ] **Step 3: Implement the shell components**

Create a continuous Musgo profundo canvas with a compact header, a centered content column, the scene region, and bottom navigation. Use text labels only where they name actions; use familiar inline icons for profile and navigation controls.

- [ ] **Step 4: Implement the first-step line**

Render the line as a CSS/SVG path with a CSS custom property for progress. Keep it organic and short, never a percentage bar. At rest it is incomplete; `lineProgress` controls only the lit segment.

- [ ] **Step 5: Add the initial Muru visual asset**

Place the approved Muru idle asset at `public/assets/muru-idle.webp` (or a clearly named local equivalent) and provide an accessible text alternative. Keep the asset lightweight and framed by the scene rather than by a hero card.

- [ ] **Step 6: Run the shell test to verify it passes**

Run `npm test -- src/components/HomeShell.test.tsx`. Expected: PASS.

- [ ] **Step 7: Verify layout at required widths**

Run the dev server with `npm run dev -- --host 0.0.0.0` and inspect 320 px, 390 px, tablet, and desktop widths. Confirm no overflow, no clipped labels, and visible keyboard focus.

- [ ] **Step 8: Commit the shell**

```bash
git add src public/assets src/styles
git commit -m "feat: add Nuvori Home shell and first-step line"
```

---

### Task 3: Add check-in and social invite flows

**Files:**
- Create: `src/state/homeReducer.ts`
- Create: `src/state/homeReducer.test.ts`
- Create: `src/components/CheckInSheet.tsx`
- Create: `src/components/SocialInviteSheet.tsx`
- Create: `src/components/CheckInControls.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/home.css`

**Interfaces:**
- `HomeState` contains `view: "rest" | "checkin" | "invite" | "active" | "capsule" | "return"`, `durationMinutes`, `energy`, `resistance`, `mood`, `isSocial`, `lineProgress`, and `sessionOutcome`.
- `homeReducer(state: HomeState, action: HomeAction): HomeState` handles `OPEN_CHECKIN`, `SET_ENERGY`, `SET_RESISTANCE`, `SET_MOOD`, `START_SOLO`, `OPEN_INVITE`, `JOIN_INVITE`, and `CLOSE_OVERLAY`.
- `CheckInSheet({ state, dispatch })` lets the user accept a recommendation without completing optional fields.
- `SocialInviteSheet({ onJoin, onClose })` displays a copyable invite code and waiting state; it does not implement real networking.

- [ ] **Step 1: Write reducer tests for the first-start paths**

```ts
it("opens the check-in without requiring a mood", () => {
  const next = homeReducer(initialHomeState, { type: "OPEN_CHECKIN" });
  expect(next.view).toBe("checkin");
  expect(next.mood).toBeUndefined();
});

it("starts a five-minute solo session from the recommendation", () => {
  const next = homeReducer(
    { ...initialHomeState, view: "checkin", resistance: 4 },
    { type: "START_SOLO", durationMinutes: 5 }
  );
  expect(next.view).toBe("active");
  expect(next.durationMinutes).toBe(5);
  expect(next.isSocial).toBe(false);
});
```

- [ ] **Step 2: Run reducer tests to verify they fail**

Run `npm test -- src/state/homeReducer.test.ts`. Expected: FAIL because the state model and reducer do not exist.

- [ ] **Step 3: Implement the state model and reducer**

Use a discriminated `HomeAction` union. Keep transitions explicit and reject invalid actions by returning the current state. Do not store server or auth concerns in this reducer.

- [ ] **Step 4: Run reducer tests to verify they pass**

Run `npm test -- src/state/homeReducer.test.ts`. Expected: PASS.

- [ ] **Step 5: Implement the check-in sheet**

Use a short energy control, a resistance scale, and optional mood. Present the recommended duration as the default action, with a clear way to choose 5, 10, 15, or 20 minutes. The sheet must remain usable with keyboard and screen reader.

- [ ] **Step 6: Implement the social invite sheet**

Open it only from the secondary Home action. Show invite code/link, copy/share affordance, and an authenticated-participant placeholder state. Keep emotional check-in data out of the sheet.

- [ ] **Step 7: Add interaction tests**

Test that the primary CTA opens check-in, a five-minute start enters the active view, the secondary action opens invite, and closing either sheet returns to rest without changing the primary recommendation.

- [ ] **Step 8: Commit the flows**

```bash
git add src/state src/components src/App.tsx src/styles/home.css
git commit -m "feat: add Nuvori check-in and social invite flows"
```

---

### Task 4: Implement active session, adaptation, and capsule states

**Files:**
- Create: `src/components/ActiveSession.tsx`
- Create: `src/components/CapsuleReveal.tsx`
- Create: `src/components/ReturnMessage.tsx`
- Create: `src/hooks/useSessionClock.ts`
- Create: `src/hooks/useSessionClock.test.ts`
- Modify: `src/state/homeReducer.ts`
- Modify: `src/App.tsx`
- Modify: `src/styles/home.css`

**Interfaces:**
- `useSessionClock({ startedAt, durationSeconds, pausedAt, pausedSeconds, now })` returns `{ remainingSeconds, progress, isComplete }` and derives time from timestamps.
- `ActiveSession({ state, dispatch })` renders the timer and exposes pause, resume, normal end, and `Hoje esta dificil` only to the host prototype.
- `CapsuleReveal({ outcome, onContinue })` renders a guaranteed capsule for `normal` or `adapted`, and no reward for `interrupted`.

- [ ] **Step 1: Write timer tests**

```ts
it("derives remaining time from timestamps", () => {
  expect(useSessionClock({
    startedAt: 1_000,
    durationSeconds: 300,
    pausedAt: undefined,
    pausedSeconds: 0,
    now: 61_000
  }).remainingSeconds).toBe(240);
});

it("does not advance while paused", () => {
  expect(useSessionClock({
    startedAt: 1_000,
    durationSeconds: 300,
    pausedAt: 61_000,
    pausedSeconds: 0,
    now: 121_000
  }).remainingSeconds).toBe(240);
});
```

- [ ] **Step 2: Run timer tests to verify they fail**

Run `npm test -- src/hooks/useSessionClock.test.ts`. Expected: FAIL because the hook does not exist.

- [ ] **Step 3: Implement the timestamp-based clock**

Keep the clock deterministic by accepting `now` as an injectable value in tests. Return a clamped `remainingSeconds` and a `progress` value between 0 and 1. Respect reduced motion in the component, not in the clock.

- [ ] **Step 4: Run timer tests to verify they pass**

Run `npm test -- src/hooks/useSessionClock.test.ts`. Expected: PASS.

- [ ] **Step 5: Implement active-session controls**

Hide bottom navigation in the active view. Show the timer in IBM Plex Mono, Muru in walking state, and the first-step line progressing by elapsed time. Model pause/resume as host-only controls in the prototype.

- [ ] **Step 6: Implement adaptation and normal ending**

Dispatch explicit actions for `END_NORMAL`, `END_ADAPTED`, and `END_INTERRUPTED`. Normal and adapted paths lead to the capsule reveal; interrupted returns to a neutral completion state without a reward.

- [ ] **Step 7: Implement capsule and return states**

Use one restrained reveal moment, complete the line for valid outcomes, and show a continuity message on return. Avoid confetti, streak language, and performance metrics.

- [ ] **Step 8: Add state transition tests**

Cover normal ending, adapted ending, interrupted ending, and returning from the capsule to the rest Home with the same Muru stage.

- [ ] **Step 9: Commit the session states**

```bash
git add src/components src/hooks src/state src/App.tsx src/styles/home.css
git commit -m "feat: add Nuvori session and capsule states"
```

---

### Task 5: Verify responsive quality and handoff

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/styles/home.css`
- Create: `README.md`
- Create: `src/a11y/home-a11y.test.tsx`

**Interfaces:**
- The finished prototype exposes `npm run dev`, `npm run build`, and `npm test` for local review.

- [ ] **Step 1: Add accessibility regression tests**

Test that the primary and secondary actions have accessible names, every sheet has a heading and close action, and keyboard focus is visible on the primary CTA.

- [ ] **Step 2: Run accessibility tests to verify the current behavior**

Run `npm test -- src/a11y/home-a11y.test.tsx`. Expected: PASS after any missing labels or focus styles are corrected.

- [ ] **Step 3: Add responsive constraints**

Use CSS grid/flex constraints instead of viewport-scaled font sizes. Ensure the longest control label wraps intentionally or receives a stable width at 320 px. Keep the bottom navigation from shifting when labels change state.

- [ ] **Step 4: Add reduced-motion behavior**

Disable line and capsule movement under `prefers-reduced-motion: reduce`, preserving the same information through color and text state changes.

- [ ] **Step 5: Run the full verification suite**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and the production build completes without TypeScript errors.

- [ ] **Step 6: Inspect the browser at target viewports**

Use the browser tooling or local devtools at 320 px, 390 px, 768 px, and 1280 px. Check the Home, check-in, invite, active, adapted, capsule, and return states for overlap, clipping, focus, and visual hierarchy.

- [ ] **Step 7: Write the handoff README**

Document the local commands, the prototype-only state model, the deliberate non-goals, and the next integration boundary (Supabase/Auth/API from the social prototype spec).

- [ ] **Step 8: Commit the verified prototype**

```bash
git add src README.md
git commit -m "chore: verify Nuvori visual prototype"
```

---

## Self-Review Checklist

- Spec coverage: tokens, Home hierarchy, first-step line, states, copy, responsive behavior, focus, and reduced motion are mapped to Tasks 1-5.
- Scope: this plan creates a browser visual prototype only; Supabase, Auth, API, offline sync, and real social sessions remain outside it.
- Type consistency: `HomeState`, `HomeAction`, `homeReducer`, `useSessionClock`, `MuruScene`, and `PrimaryAction` are named once and consumed consistently.
- Placeholder scan: no unfinished markers, vague error-handling steps, or unspecified test steps remain.
