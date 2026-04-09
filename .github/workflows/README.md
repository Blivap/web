# CI/CD Workflows

This project uses GitHub Actions with two workflows:

- `ci.yml`:
  - Runs on every push and pull request.
  - Executes `yarn lint`, `npx tsc --noEmit`, and `yarn build`.
- `cd.yml`:
  - Runs on pushes to `main` (and manual dispatch).
  - Re-runs quality gates, then deploys to Vercel production.

## Required GitHub Secrets (for CD)

Set these in repository settings:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

If these are missing, the deploy job is skipped safely.
