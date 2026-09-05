# TaxEaseLK — Frontend

Next.js (App Router) + TypeScript + Tailwind rebuild of the TaxEaseLK Figma
prototype.

## Running it locally

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + API URL later
npm run dev
```

Open http://localhost:3000 — it redirects to `/sign-in`.

## How the code is organized

```
app/
  (auth)/           Public pages: role select, sign in, sign up (x2)
  (business)/        Business Owner portal (has its own layout.tsx = sidebar + top bar)
    dashboard/
    documents/
    financials/
    auditor-review/
    settings/
  (auditor)/          Auditor portal (its own layout.tsx)
    auditor-dashboard/
    companies/
    review-queue/
    issues/
    audit-log/
    auditor-settings/

components/
  ui/                Small reusable pieces: Button, Card, Badge, Input, StatCard, ProgressBar
  layout/            Sidebar, TopBar, AuthBrandPanel, ComingSoon

lib/
  api/               Data-fetching functions, ONE FILE PER PORTAL (business.ts, auditor.ts).
                     Pages call these instead of fetching directly, so we can
                     swap mock data for real FastAPI calls without touching
                     any page.
  types/             Shared TypeScript types (the shape of our data)
```

### The (business) and (auditor) folders

The parentheses mean "route group" — a Next.js feature that lets multiple
routes share a layout (the sidebar + top bar) without the group name
showing up in the URL. So `app/(business)/dashboard/page.tsx` is served at
`/dashboard`, not `/business/dashboard`.

### Why `lib/api/`?

Every page reads data by calling a function like `getDashboardSummary()`.
Right now that function returns hard-coded mock data. When your FastAPI
backend is ready, you only edit the inside of that one function — swap the
mock object for a `fetch()` call — and the page that renders it doesn't
change. Look at `lib/api/business.ts` for the pattern; every future data
file should follow the same shape.

### "Coming soon" placeholders

A few settings tabs (Users/Security/Notifications on the business side;
Security/Notifications/Preferences on the auditor side) render a short
placeholder — those forms weren't in the Figma export beyond their tab
label. Everything else in the app is fully built.

## Design tokens

Colors were sampled directly from the Figma export and live in
`tailwind.config.ts` under `brand.*` and `status.*` — e.g. `bg-brand-navy`,
`text-status-critical`, `bg-status-warning-bg`. Always reach for these
instead of raw hex values so the whole app stays visually consistent.

## What's done vs. next

**Done so far:**
- Project scaffold, Tailwind design tokens, reusable UI kit
- Choose your role, Sign in, Sign up (Business), Sign up (Auditor) — all route into a portal on submit (mocked, see TODOs)
- **Business portal: fully built** — Dashboard, Documents, Financials, Auditor Review, Settings
- **Auditor portal: fully built** — Dashboard, Companies, Review Queue (filterable), Issues (filterable), Audit Log, Settings

**Next up:** wiring Supabase auth + your FastAPI endpoints (swap the
inside of every function in `lib/api/business.ts` and `lib/api/auditor.ts`
for real `fetch()` calls), then polish and demo prep.

## Local file upload (works without a backend)

The Documents page (`components/business/DocumentsManager.tsx` +
`DocumentUploadZone.tsx`) uses the browser's real file picker / drag-and-
drop — this needed no backend to build:

- **Validation** (`lib/files.ts`) rejects wrong file types or files over
  10MB, with an inline error message per rejected file.
- **Accepted files appear in the table immediately** with a "Processing"
  status (spinning icon), then resolve to "Processed" or "Review
  Required" after a short simulated delay with a random AI confidence —
  standing in for what your FastAPI backend's real AI extraction step
  will eventually return.
- **Remove** (trash icon) deletes a row from the list.
- Stat tiles (Uploaded/Processed/Review Required) recompute live from
  the actual list, so they can never drift out of sync with the table.

When the backend is ready, the only change needed is inside
`handleFilesAccepted` in `DocumentsManager.tsx` — swap the
`setTimeout(...)` simulation for a real `fetch()` POST with
`FormData`, per the TODO comment there.

The auditor Settings "Change Photo" button works the same way — picks a
local image and previews it immediately via `URL.createObjectURL`, no
upload required to see the preview.

## Splash screen (shows once per app load, not per tab)

`components/layout/AppSplash.tsx` shows the TaxEaseLK splash (matching
the Figma "Loading screen" asset) for about a second when the app is
first opened or hard-refreshed, then fades out. It's mounted once in
the root `app/layout.tsx`.

This intentionally does NOT use Next.js's `loading.tsx` file convention
— that convention shows a loading UI on every navigation where a page
suspends while fetching data, which would make the splash reappear
every time you click a sidebar link. Since Next.js keeps the root
layout mounted across client-side navigation and only remounts it on
an actual browser page load, a plain client component with local state
is the right tool for a true one-time splash.

## Language toggle (EN / SI / TA)

A hand-rolled i18n system lives in `lib/i18n/` — no external package,
since the sandbox this was built in has no npm registry access, but
also because the app's translation needs are simple enough (static UI
copy, no pluralization/interpolation) that a ~40-line Context is easier
to understand and extend for a demo than configuring a full library.

- `lib/i18n/translations.ts` — flat dictionaries for `en`, `si`, `ta`.
  Add new keys here as you translate more of the app; keep all three
  languages in sync (the same key set) or `t()` silently falls back to
  English for a missing key.
- `lib/i18n/LanguageContext.tsx` — `<LanguageProvider>` (wraps the app
  in `app/layout.tsx`) + `useLanguage()` hook exposing `{ language,
  setLanguage, t }`. Persists the choice to `localStorage`.
- `components/layout/T.tsx` — `<T k="pages.dashboard.title" />`. Drop
  this into any **Server Component** page to render translated text
  without converting the whole page to a Client Component — only the
  `<T>` itself re-renders when the language changes.
- `components/layout/LanguageToggle.tsx` — the EN / සිං / தமி switch in
  the top bar of both portals, next to the company/FY (or "All
  Companies") pickers.

**Scope today:** sidebar nav labels, top bar chrome, and every page's
`<h1>` + subtitle are translated (40 keys total, verified in sync
across all three languages). Table contents, mock company names, and
document names are treated as **data** rather than UI copy and are
left untranslated — that content will eventually come from the FastAPI
backend, which may have its own localization strategy. Extending
coverage further just means adding more keys to `translations.ts` and
wrapping more strings in `<T k="..." />`.

## Notification panel + profile dropdown

- `components/layout/NotificationBell.tsx` — clicking the bell opens a
  real dropdown panel (mock notifications for now — swap the
  `NOTIFICATIONS` array for a fetch once there's a backend endpoint).
  Closes on an outside click.
- `components/layout/ProfileMenu.tsx` — clicking the avatar in the top
  bar opens a panel with name/email, a Profile/Settings link, and
  Logout. Same outside-click-to-close pattern.

Both replaced what were previously dead, non-functional buttons.
