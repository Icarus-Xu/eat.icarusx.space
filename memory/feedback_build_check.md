---
name: Prefer dev server over production build for verification
description: User prefers pnpm dev to verify changes, not pnpm build
type: feedback
---

Use `pnpm dev` (dev server) to verify changes during development. Reserve `pnpm build` for final pre-commit checks only.

**Why:** Faster feedback loop; user finds production builds unnecessary for routine verification.

**How to apply:** After implementing features, suggest `pnpm dev` to test. Only run `pnpm build` before committing if there is a specific reason to catch type/compile errors early.
