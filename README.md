# RUNWAY — 30-Day Financial Cockpit for Gen Z

> "Try the decision before it costs you."

RUNWAY is an interactive personal finance decision simulator designed for Gen Z to manage a limited ₹10,000 budget over a 30-day cycle. Built with React, TypeScript, Tailwind CSS v4, Motion, and an explainable, pure financial engine.

---

## Quick Start

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

### Verification & Testing
```bash
# Type check and build
npm run build

# Run unit tests
npm run test

# Lint with zero warnings
npm run lint

# TypeScript verification only
npm run typecheck
```

---

## Architecture Overview
- **Pure Financial Engine**: Driven by `computeSnapshot(state, asOf)` producing an immutable financial health and runway snapshot.
- **Design System ("Paper & Volt")**: Warm receipt paper `#FBF8F3` with electric volt `#D4F23A` highlights, high-contrast typography, and accessible indicators.
- **Zero Fabricated Data**: Authentic empty states, user-created records, and local-first browser persistence.
- **Decision Lab**: Simulates purchases, subscriptions, and stress tests (surprise expenses, delayed income) with before/after ripples.

For comprehensive architectural design and domain modeling, review [`docs/PRODUCT_SPEC.md`](./docs/PRODUCT_SPEC.md).
