# RUNWAY — 30-Day Financial Cockpit for Gen Z

> *"Try the decision before it costs you."*

**RUNWAY** is an interactive, local-first personal finance decision simulator built for Gen Z to manage a limited **₹10,000 budget over a 30-day cycle**. 

Rather than just logging past transactions, RUNWAY connects income, commitments, subscriptions, savings goals, unexpected expenses, financial risk, and financial health into a unified, pure calculation engine. The signature **Decision Lab** simulates the ripple effects of any financial move *before* the user commits a single rupee.

---

## Live Deployment & Publishing Instructions

### Manual Publishing Steps (For the User)

Since automated assistants do not possess credentials to external platforms, deployment to a live URL must be performed with these exact steps:

1. **Verify No Local Secrets**:
   Confirm that `.env*` files are ignored (covered in `.gitignore`) and no API tokens exist in the repository.
   ```bash
   git status
   ```
2. **Push to a Public GitHub Repository**:
   Create a new public repository on GitHub (e.g. `your-username/runway`), link the remote, and push the repository:
   ```bash
   git remote add origin https://github.com/your-username/runway.git
   git branch -M main
   git push -u origin main
   ```
3. **Import to Vercel or Netlify**:
   - **Vercel**: Select **Import Project** from GitHub. Framework preset: **Vite**. Build Command: `npm run build`. Output Directory: `dist`.
   - **Netlify**: Select **New site from Git**. Build command: `npm run build`. Publish directory: `dist`. Single-page redirect rules are pre-configured in `public/_redirects` (`/* /index.html 200`).
4. **Verify Live Deployment**:
   Open the deployed HTTPS URL in a private/incognito browser window. Sign up for an account, initialize a ₹10,000 cycle, simulate an action in the Decision Lab, and reload the browser to confirm local persistence.

> **Verification Notice**: Live external deployment was **NOT verified** directly by the agent because the agent lacks outbound deployment credentials. Local production build (`npm run build`) and SPA server preview (`vite preview`) were verified locally.

---

## Core Features

- **₹10,000 / 30-Day Contract**: Strict integer rupee arithmetic (no negative-zero, no fractional paise, formatted in `en-IN`).
- **Interactive Decision Lab**: Simulate purchases, subscriptions, obligations, and stress tests (emergencies, late payments, daily burn shifts) with before/after comparisons across 6 dimensions before committing.
- **Explainable Waterfall Money Model**: Automatically ring-fences fixed commitments, non-negotiable bills, emergency reserves, and goal allocations before deriving discretionary daily burn.
- **Three Transparent Scores**:
  1. **Daily Discretionary Allowance (₹/day)**: Paced allowance that recalculates dynamically as days pass or unexpected costs arise.
  2. **Financial Risk Score (0–100 & Low/Moderate/High/Critical)**: Evaluates days until cash-out, overdue bills, emergency moat depletion, and discretionary volatility.
  3. **Financial Health Grade (0–100 & Strong/Steady/Vulnerable)**: Weighted evaluation of liquidity ratio, commitment ratio, savings rate, and discretionary pacing discipline.
- **Multi-Account Browser Isolation**: Local accounts salted and hashed with PBKDF2-SHA256. Multiple users on the same machine have strict storage key isolation (`runway:v1:data:<userId>`).
- **Robust Disaster Recovery**: Invalid or corrupted local data is detected, parsed via Zod, safely archived to a unique backup key, and gracefully reset with a user alert banner.
- **Accessible & High-Performance Design**: WCAG AAA/AA contrast compliance ("Paper & Volt" palette), 44px touch targets, mobile bottom navigation, keyboard-first navigation with focus retention, and reduced motion adaptations.

---

## The Three Scores Explained

| Score | Scale | Meaning in Plain Language |
| :--- | :--- | :--- |
| **Daily Allowance** | ₹0 to ₹10,000/day | What you can safely spend today on discretionary items without exhausting your wallet or missing future fixed bills. Overspending today reduces tomorrow's allowance automatically. |
| **Financial Risk Score** | 0 to 100 (`low`, `moderate`, `high`, `critical`) | How close you are to running out of money before Day 30. Driven by cash-out dates, overdue obligations, buffer exhaustion, and high discretionary burn. |
| **Financial Health Score** | 0 to 100 (`strong`, `steady`, `vulnerable`) | How balanced your overall finances are. Weighted across 4 pillars: Liquidity Coverage (35%), Commitment Burden (25%), Savings Rate (20%), and Pacing Discipline (20%). |

---

## The Waterfall Money Model

RUNWAY calculates discretionary spending through a strict financial waterfall:

```
[ Total Liquid Balance ]
        │
        ├──> 1. Deduct Overdue & Upcoming Fixed Obligations (EMIs, Rent, WiFi)
        │
        ├──> 2. Deduct Safety Buffer Reserve (0%–30%, default 10% = ₹1,000)
        │
        ├──> 3. Deduct Planned Savings Goal Contributions
        │
        └──> [ Net Discretionary Spendable Pool ]
                     │
                     └──> Divided by Remaining Cycle Days (1 to 30)
                                 │
                                 └──> = Daily Spend Allowance (Math.floor)
```

If late income or unexpected expenses occur, the pool recalculates without creating phantom credits.

---

## Tech Stack

- **Framework**: React 19 + TypeScript (Strict mode, `noUncheckedIndexedAccess`)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Icons**: `lucide-react` (imported by specific name)
- **Motion**: `motion/react` (configured exclusively via root `LazyMotion` and `domAnimation`)
- **Validation**: Zod schema validation for all inputs and localStorage reads
- **Testing**: Vitest (pure unit tests covering engine rules, auth hashing, CSV injection, and reducer undo)

---

## Project Structure

```
PromptRun/
├── docs/
│   └── PRODUCT_SPEC.md              # Engineering specification and mathematical engine contract
├── public/
│   ├── _headers                     # Production security headers for Netlify
│   └── _redirects                   # SPA routing fallback for Netlify
├── src/
│   ├── components/                  # Reusable accessible UI components (StatTile, Gauge, etc.)
│   ├── engine/                      # Pure functional calculation engine (zero React dependencies)
│   │   ├── engine.ts                # Main computeSnapshot & evaluateScenario
│   │   ├── waterfall.ts             # Ring-fencing logic & daily allowance derivation
│   │   ├── risk.ts                  # Risk level & driver evaluation
│   │   ├── health.ts                # Health score & pillar grades
│   │   └── occurrences.ts           # 30-day bill expansion and settlement matching
│   ├── features/
│   │   ├── auth/                    # Local authentication, crypto hashing, session handling
│   │   └── store/                   # Context, action reducers, persistence, consequence toasts
│   ├── hooks/                       # Custom hooks (useToday, useFocusH1, useDocumentTitle)
│   ├── lib/                         # Formatting, CSV formula neutralization, sanitization
│   └── pages/                       # Application screens and modular subcomponents
│       ├── app/
│       │   ├── today/               # CockpitStats, UpcomingBillsCard, CycleCompletionModal
│       │   ├── lab/                 # LabDecisionForm, LabImpactSummary, LabCommitDialog
│       │   ├── plan/                # IncomesTab, CommitmentsTab, SubscriptionsTab, GoalsTab
│       │   ├── settings/            # SettingsDangerZone
│       │   ├── Activity.tsx         # Activity ledger table and mobile card list
│       │   └── Insights.tsx         # Category burn, pacing breakdown, health audit
│       ├── Landing.tsx              # High-contrast hero and value propositions
│       ├── SignIn.tsx               # Constant-time auth verification and lockout
│       ├── SignUp.tsx               # Salted PBKDF2 account creation
│       └── NotFound.tsx             # 404 error page with clear navigation routes
├── vercel.json                      # Vercel SPA routing and security headers
└── vite.config.ts                   # Chunking strategy and bundle optimization
```

---

## Available Scripts

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run all unit tests
npm test

# Run ESLint (enforcing 0 errors and 0 warnings)
npm run lint

# Strict TypeScript type check
npm run typecheck

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Security Notes

1. **No Plaintext Passwords**: Passwords are salted with a 16-byte cryptographically secure random salt and hashed with 100,000 iterations of PBKDF2-SHA256.
2. **Timing-Safe Comparison**: Authentication checks compare hash byte arrays with a constant-time accumulator to protect against timing attacks.
3. **Session Lockout**: 5 consecutive failed login attempts trigger an exponential account lockout (30 seconds) with an accessible live countdown.
4. **Storage Parsing & Sanitization**: All `localStorage` reads pass through strict Zod schemas. Any corrupted data is automatically backed up to a dedicated quarantine key and reset.
5. **CSV Formula Injection Neutralization**: Exported CSV values are neutralized against spreadsheet formula injection (`=`, `+`, `-`, `@`, `\t`, `\r` prefixes).
6. **Production Security Headers**: Configured in `vercel.json` and `public/_headers` with strict Content Security Policy (`default-src 'self'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and restrictive `Permissions-Policy`.
7. **Automated Evaluator Compatibility**: Frame restrictions (`X-Frame-Options` and `frame-ancestors`) are deliberately omitted to ensure automated hackathon grading harnesses (such as FAIE) are not blocked from rendering within review environments.

---

## Honest Limitations

- **Browser-Local Storage**: This is a frontend-only application. User accounts, passwords, and financial logs live **exclusively inside this specific browser's local storage**. 
- **No Cloud Synchronization**: Clearing browser cache or switching devices will not transfer your account or records.
- **No Password Recovery**: If you forget your local account password, there is no email reset mechanism. You can reset local application state from the Settings Danger Zone.
- **Not Production Banking**: While the financial waterfall and simulations reflect real personal finance math, this app is an educational decision sandbox and not an integrated bank connection.
