# eMakao — Property Management Platform

A Turborepo monorepo for the eMakao property management platform, serving three distinct user groups: **property managers (staff)**, **residents (tenants)**, and a **mobile tenant app**.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Running Individual Apps](#running-individual-apps)
- [Environment Variables](#environment-variables)
- [Generating API Types](#generating-api-types)
- [Project Structure](#project-structure)
- [Packages](#packages)
- [Apps](#apps)
- [Common Commands](#common-commands)
- [Development Notes](#development-notes)

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Turborepo Monorepo              │
│                                                  │
│  apps/                                           │
│  ├── web-staff       Next.js   :3000   (staff)   │
│  ├── web-resident    Next.js   :3002   (tenant)  │
│  └── mobile         Expo RN   :8081   (tenant)   │
│                                                  │
│  packages/                                       │
│  ├── api-types       Generated OpenAPI types     │
│  ├── api-client      Typed openapi-fetch client  │
│  ├── shared          Currency + phone utilities  │
│  └── ui              Shared React components     │
│                                                  │
│  Backend (separate repo)                         │
│  └── Axum (Rust)     HTTP      :8000             │
└─────────────────────────────────────────────────┘
```

**Auth flow:** `web-staff` and `web-resident` both handle authentication through Next.js API route handlers (`/api/auth/login`). On success the Axum JWT is stored in an HTTP-only cookie. All backend calls are proxied through `/api/proxy/[...path]` which reads the cookie and forwards it as a `Bearer` token — the browser never touches the JWT directly.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo 2 + pnpm 9 workspaces |
| Web framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, shadcn/ui (base-nova), @base-ui/react |
| Data fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod v4 |
| Mobile | Expo SDK 56, React Native 0.85, Expo Router |
| Mobile animations | React Native Reanimated 4 |
| API contract | openapi-typescript + openapi-fetch |
| Backend | Axum (Rust) — lives in a separate repository |
| Language | TypeScript 5.9 throughout |

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 18 | |
| pnpm | 9.x | `npm install -g pnpm@9` |
| Expo CLI | latest | `npm install -g expo-cli` (mobile only) |
| Rust backend | — | Clone and run separately; see backend repo |

> **Apple Silicon / iOS simulator:** Xcode 15+ and the iOS simulator must be installed to run the mobile app on iOS.

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/emakao-frontend.git
cd emakao-frontend

# 2. Install all dependencies (all apps + packages at once)
pnpm install

# 3. Copy environment files
cp apps/web-staff/.env.example apps/web-staff/.env.local
cp apps/web-resident/.env.example apps/web-resident/.env.local

# 4. Start the Axum backend (separate terminal, separate repo)
#    It must be running before the web apps will serve real data.

# 5. Run all web apps in parallel
pnpm dev
```

Open:
- Staff workspace → http://localhost:3000
- Resident portal → http://localhost:3002
- Mobile → press `i` (iOS) or `a` (Android) in the Expo terminal

---

## Running Individual Apps

### Staff workspace only
```bash
pnpm dev:staff
# → http://localhost:3000
```

### Resident portal only
```bash
pnpm --filter web-resident dev
# → http://localhost:3002
```

### Mobile app only
```bash
pnpm dev:mobile
# Expo dev server starts. Then:
# i → open iOS simulator
# a → open Android emulator
# w → open in browser (limited)
# Scan QR code with Expo Go on a physical device
```

### Run a specific package script
```bash
pnpm --filter @emakao/shared check-types
pnpm --filter web-staff build
```

---

## Environment Variables

### `apps/web-staff/.env.local`

```env
# URL of the Axum backend. Used by the Next.js API proxy routes.
# Never exposed to the browser — server-side only.
NEXT_PUBLIC_API_URL=http://localhost:8000

# Set to "production" to enable secure cookies and HTTPS-only flags.
# Leave unset (or "development") for local HTTP.
NODE_ENV=development
```

### `apps/web-resident/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### `apps/mobile` (via `app.json` → `extra`)

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://localhost:8000"
    }
  }
}
```

Read in code via:
```ts
import Constants from "expo-constants";
const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8000";
```

> **Physical device testing:** Replace `localhost` with your machine's LAN IP (e.g. `192.168.1.x`) so the device can reach your dev backend.

---

## Generating API Types

The `packages/api-types` package contains TypeScript types auto-generated from the backend's OpenAPI spec. Regenerate whenever the backend schema changes.

```bash
# Backend must be running at localhost:8000
# (or wherever NEXT_PUBLIC_API_URL points)

cd packages/api-types

# Fetch the live spec and regenerate src/schema.d.ts
pnpm generate-types

# Or if you have a local openapi.json snapshot:
pnpm generate
```

The generated file is `packages/api-types/src/schema.d.ts`. It is committed to the repo so CI can build without a running backend. Named convenience re-exports are in `packages/api-types/src/index.ts` — add entries there whenever a new type is used across multiple apps.

---

## Project Structure

```
emakao-frontend/
│
├── apps/
│   ├── web-staff/                  # Next.js — property manager workspace
│   │   └── src/
│   │       ├── app/
│   │       │   ├── (auth)/login/   # Login page
│   │       │   ├── (dashboard)/    # Protected pages (sidebar layout)
│   │       │   │   ├── layout.tsx
│   │       │   │   ├── properties/
│   │       │   │   ├── leases/
│   │       │   │   ├── maintenance/
│   │       │   │   └── finance/
│   │       │   └── api/
│   │       │       ├── auth/login/ # Auth handler — sets HTTP-only cookie
│   │       │       └── proxy/      # Catch-all proxy → Axum backend
│   │       ├── components/
│   │       │   ├── ui/             # shadcn/base-ui components
│   │       │   ├── providers.tsx   # QueryClientProvider
│   │       │   └── dashboard-shell.tsx  # Sidebar + layout (client)
│   │       └── hooks/
│   │           ├── use-properties.ts
│   │           ├── use-agreements.ts
│   │           ├── use-work-orders.ts
│   │           ├── use-bank-statements.ts
│   │           └── index.ts        # Re-exports all hooks
│   │
│   ├── web-resident/               # Next.js — tenant portal
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx        # Landing / redirect
│   │       │   └── dashboard/      # Tenant dashboard
│   │       └── components/
│   │           └── providers.tsx
│   │
│   └── mobile/                     # Expo — tenant mobile app
│       └── src/
│           ├── app/
│           │   ├── _layout.tsx     # Root layout + splash animation
│           │   └── (tabs)/         # Tab screens
│           │       ├── _layout.tsx
│           │       ├── index.tsx   # My Home / dashboard
│           │       ├── payments.tsx
│           │       └── maintenance.tsx
│           ├── components/         # Themed RN components
│           ├── constants/theme.ts  # Colors, spacing, fonts
│           └── hooks/
│
├── packages/
│   ├── api-types/                  # Generated OpenAPI types + named exports
│   │   └── src/
│   │       ├── schema.d.ts         # Auto-generated — do not edit manually
│   │       └── index.ts            # Named convenience re-exports
│   │
│   ├── api-client/                 # Typed openapi-fetch client factory
│   │   └── src/index.ts
│   │
│   ├── shared/                     # Framework-agnostic utilities
│   │   └── src/
│   │       ├── currency.ts         # formatKES, parseMoney, sumMoney
│   │       ├── phone.ts            # normalizePhone, toMpesaPhone
│   │       └── index.ts
│   │
│   ├── ui/                         # Shared React components (web)
│   ├── eslint-config/              # Shared ESLint rules
│   └── typescript-config/          # Shared tsconfig bases
│
├── turbo.json                      # Turborepo task pipeline
└── package.json                    # Root scripts + devDependencies
```

---

## Packages

### `@emakao/api-types`
Auto-generated TypeScript types from the OpenAPI spec. Named re-exports cover all domain types:

```ts
import type { Property, Agreement, WorkOrder, BankStatement } from "@emakao/api-types";
```

### `@emakao/api-client`
A pre-configured `openapi-fetch` client. In web apps use the default `apiClient` (routes through the Next.js proxy). For mobile or server-to-server use the `createApiClient` factory:

```ts
// Web (staff / resident) — proxy handles auth
import { apiClient } from "@emakao/api-client";
const { data } = await apiClient.GET("/api/v1/properties");

// Mobile — supply base URL and token directly
import { createApiClient } from "@emakao/api-client";
const client = createApiClient({ baseUrl: API_URL, headers: { Authorization: `Bearer ${token}` } });
```

### `@emakao/shared`
Pure utilities with no framework dependencies — safe to import in Next.js, Expo, or plain Node.js:

```ts
import { formatKES, parseMoney, sumMoney } from "@emakao/shared";
import { normalizePhone, toMpesaPhone, formatPhoneDisplay } from "@emakao/shared";

formatKES(50000)                    // "KES 50,000"
formatKES("1250.50", { decimals: true })  // "KES 1,250.50"
formatKES(1_500_000, { compact: true })   // "KES 1.5M"

normalizePhone("0712345678")        // "+254712345678"
toMpesaPhone("0712345678")         // "254712345678"
```

---

## Apps

### `web-staff` — Staff Workspace

The primary dashboard for property managers and agency staff.

| Route | Description |
|---|---|
| `/login` | Staff login (sets HTTP-only JWT cookie) |
| `/dashboard` | Overview |
| `/properties` | CRUD for property portfolio |
| `/leases` | Agreement management + termination |
| `/maintenance` | Work order tracking + status updates |
| `/finance` | Bank statement reconciliation |

**API calls** go to `/api/proxy/*` which forwards to Axum with the JWT from the cookie. The browser never directly calls the backend.

### `web-resident` — Resident Portal

A lightweight tenant-facing portal.

| Route | Description |
|---|---|
| `/` | Landing / redirect |
| `/dashboard` | Rent balance, invoices, quick actions |

### `mobile` — Expo App (iOS + Android)

Tenant mobile app with three tabs:

| Tab | Description |
|---|---|
| My Home | Tenancy summary, active lease card |
| Payments | Invoice history, M-Pesa STK push |
| Requests | Submit and track maintenance requests |

The mobile app calls the Axum backend directly (no Next.js proxy layer). Authentication tokens must be stored in Expo SecureStore and passed to `createApiClient`.

---

## Common Commands

### Development

```bash
pnpm dev                     # Run all apps in parallel
pnpm dev:staff               # web-staff only
pnpm dev:mobile              # mobile (Expo) only
pnpm --filter web-resident dev   # web-resident only
```

### Building

```bash
pnpm build                   # Build all apps (respects Turborepo cache)
pnpm --filter web-staff build    # Build one app
```

### Type checking

```bash
pnpm check-types             # Check types across all packages and apps
```

### Linting & formatting

```bash
pnpm lint                    # Lint all packages
pnpm format                  # Prettier format all .ts/.tsx/.md files
```

### API type generation

```bash
# Requires backend running at NEXT_PUBLIC_API_URL
cd packages/api-types && pnpm generate-types
```

### Cleaning caches

```bash
# Clear Turborepo build cache
npx turbo daemon stop && rm -rf .turbo node_modules/.cache

# Full clean (nuke all node_modules and reinstall)
find . -name "node_modules" -type d -prune -exec rm -rf {} + && pnpm install
```

---

## Development Notes

### Port allocation

When running all apps simultaneously, set explicit ports to avoid conflicts:

| App | Recommended port | How to set |
|---|---|---|
| `web-staff` | 3000 | `next dev --port 3000` in `apps/web-staff/package.json` |
| `web-resident` | 3002 | `next dev --port 3002` in `apps/web-resident/package.json` |
| Axum backend | 8000 | Set in backend `.env` |
| Expo Metro | 8081 | Default — change via `EXPO_PORT=xxxx` |

### Turborepo task pipeline

Tasks declared in `turbo.json` respect dependency order:

```
build → runs packages first, then apps
lint  → runs all in parallel
dev   → persistent (never completes), all in parallel
```

Adding a new package dependency? Run `pnpm install` from the repo root — pnpm workspaces handles linking automatically.

### Adding a new API hook (web-staff)

1. Add named type exports to `packages/api-types/src/index.ts` if needed.
2. Create `apps/web-staff/src/hooks/use-<resource>.ts` following the existing pattern (optimistic updates + `onSettled` invalidation).
3. Re-export from `apps/web-staff/src/hooks/index.ts`.

### Schema status values are lowercase

Backend enums use lowercase strings throughout:

```ts
// ✅ Correct
AgreementStatus: "active" | "terminated" | "draft" | ...
WorkOrderStatus: "open" | "inprogress" | "completed" | "cancelled"
WorkOrderPriority: "low" | "medium" | "high" | "emergency"

// ❌ Wrong (old code used these — don't copy them)
"ACTIVE" | "TERMINATED" | "OPEN" | "IN_PROGRESS"
```

### Bank statement reconciliation

The list endpoint (`GET /api/v1/bank-statements`) intentionally omits transaction lines and reconciliation counts for performance. To show reconciliation status on a detail view:

```ts
// Gets unmatched_count, matched_count, unmatched_lines[]
const { data: report } = useReconciliationReport(statementId);
```

### Cookie-based auth in development

`secure: false` is set when `NODE_ENV !== "production"`, so cookies work over plain HTTP locally. When testing in production-like mode (HTTPS), make sure `NODE_ENV=production` is set or cookies will be silently rejected by the browser.

### Mobile — physical device

Replace all `localhost` references with your machine's local IP address:

```env
# apps/mobile app.json extra.apiUrl
"apiUrl": "http://192.168.1.x:8000"
```

The Expo Go app on a physical device cannot reach `localhost` on your machine — it needs the LAN IP.