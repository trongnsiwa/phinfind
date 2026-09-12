# Contributing to PhinFind

## Prerequisites
- Node.js 20.x
- pnpm 9.x (`corepack enable && corepack prepare pnpm@latest-9 --activate`)

## Local Setup
1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Set up local environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your local Supabase credentials and Geoapify API key.
3. Start the development server:
   ```bash
   pnpm dev
   ```

## Branch Naming
Follow standard branch naming prefixes matching the roadmap item ID:
- `feat/FEAT-XX-slug` (new features)
- `fix/BUG-XX-slug` (bug fixes)
- `chore/TD-XX-slug` (technical debt)
- `chore/OPS-XX-slug` (devops, CI/CD, tooling)

## Commit Messages
Reference the roadmap item ID in commit messages:
- Example: `feat(FEAT-07): add shop filter by coffee brew method`
- Example: `chore(OPS-01): configure GitHub Actions CI workflow`

## Before You Open a PR
Run all validation checks locally to ensure a green CI run:
```bash
pnpm lint          # ESLint checks
pnpm tsc --noEmit  # TypeScript type checking
pnpm test          # Vitest unit test suite
pnpm build         # Next.js production build
```

## CI Overview
The GitHub Actions CI workflow runs automatically on pushes to `main` and on pull requests targeting `main`.

| Job | Steps | Target Runtime (warm cache) |
|:---|:---|:---|
| `quality` | `pnpm lint`, `pnpm tsc --noEmit`, `pnpm test` | < 3 minutes |
| `build` | `pnpm build` (uploads manifest on failure) | 1–2 minutes |
| `ci-summary` | Aggregates status; gatekeeper check | < 15 seconds |

Total pipeline execution completes in under 5 minutes. E2E tests are out of scope for CI and run manually before risky releases.

## Required GitHub Actions Secrets
Configure these repository secrets in GitHub (`Settings -> Secrets and variables -> Actions`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_GEOAPIFY_API_KEY`
- `NEXT_PUBLIC_APP_URL` (optional in CI; defaults to `https://example.vercel.app`)

> **Note:** These variables are safe to use in CI because they carry the `NEXT_PUBLIC_` prefix and are already bundled into public client code in production. If secrets are not configured (e.g. fork PRs), the build step gracefully skips while the quality job still runs.

## Branch Protection Rules
Configure the following manually in GitHub repository settings for the `main` branch:
- **Require status checks to pass before merging**: Select `ci-summary`
- **Require branches to be up to date before merging**: Enabled
- **Require linear history**: Enabled
- **Do not allow force pushes**: Enabled (Block force pushes to `main`)

## Deployment
- **Production**: Vercel automatically deploys commits merged into `main`.
- **Preview**: Pull requests automatically receive isolated Vercel preview URLs for visual verification.
