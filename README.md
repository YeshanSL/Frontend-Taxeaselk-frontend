# TaxEaseLK — Frontend

Next.js (App Router) + TypeScript + Tailwind rebuild of the TaxEaseLK Figma
prototype.

## Running it locally

```bash
npm install
cp .env.local.example .env.local   # fill in Supabase + API URL later
npm run dev
```

Open http://localhost:3000 — it redirects to `/role` (Choose your role).

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
  api/               Data-fetching functions, ONE PER FEATURE (e.g. business.ts).
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

Pages not yet built (Documents, Financials, Auditor Review, Settings, and
the whole Auditor portal) currently render a `<ComingSoon />` placeholder
so the app is fully clickable today with no broken links. Each is labeled
with the day it's scheduled to be built, per the roadmap. Replace the
placeholder's contents in-place when its day comes — the routing and
layout around it won't need to change.

## Design tokens

Colors were sampled directly from the Figma export and live in
`tailwind.config.ts` under `brand.*` and `status.*` — e.g. `bg-brand-navy`,
`text-status-critical`, `bg-status-warning-bg`. Always reach for these
instead of raw hex values so the whole app stays visually consistent.

## What's done vs. next

**Done so far:**
- Project scaffold, Tailwind design tokens, reusable UI kit
- Choose your role, Sign in, Sign up (Business), Sign up (Auditor) — all route into a portal on submit (mocked, see TODOs)
- Business portal: Dashboard, Documents, Financials, Auditor Review, Settings — all fully built
- Auditor portal shell (sidebar + top bar) — pages still placeholders
- Placeholder pages for the Auditor portal so nothing 404s

**Next up:** the whole Auditor portal — Dashboard, Companies, Review
Queue, Issues, Audit Log, Settings — then wiring Supabase auth + your
FastAPI endpoints, then polish.
