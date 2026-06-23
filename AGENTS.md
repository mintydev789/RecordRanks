# RecordRanks

RecordRanks is a sports organization and ranking system for organizing competitions, managing results, and tracking rankings and records. See README.md for full details.

## Project Structure

Monorepo with:

- **Root**: Deployment config (Docker Compose, Caddy, etc.)
- **`bin/`**: scripts
- **`client/`**: full-stack Next.js web application
- **`client/server`**: backend files
- **`client/server/server-functions`**: React server functions, with one file for each DB entity and a `server-functions.ts` file for random stuff; each server function ends with the suffix `SF` for clarity and uses `next-safe-action`
- **`client/server/server-only-functions.ts`**: just regular functions (not React server functions) that are only used server-side, due to relying on the DB or other backend tools

## Tech Stack

- **Framework**: Next.js (App Router, RSCs, React Server Functions)
- **Actions**: [next-safe-action](https://next-safe-action.dev/)
- **Backend tools**: Self-hosted Supabase (Postgres, Storage, Logs, Cron)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Package Manager**: [PNPM](https://pnpm.io/)
- **Formatting/Linting**: [Biome](https://biomejs.dev/)

## Deployment

Self-hostable on any Linux server with Docker. Official instance runs at [app.recordranks.com](https://app.recordranks.com). Marketing site at [recordranks.com](https://recordranks.com) shares the same Supabase instance but uses a separate Postgres schema. Third-party RecordRanks instances use their own domains.

## Multi-Tenancy

Supports both multi-tenant mode (multiple sports organizations on one instance) and single-tenant mode. Each organization gets its own URL slug and isolated data in multi-tenant mode.

## Scripts

Custom scripts in `bin/` for production and development tasks (DB migrations, Supabase management, Docker builds, backups). See README for details.

## Constraints

- **.env files**: Don't try to read the `.env` files, except `.env.example`.
