# Contributing to BlueRoute Logistics

Thanks for your interest in improving BlueRoute. This document covers how to get set up locally and the conventions used across the project.

## Getting Started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/BlueRoute.git
   cd BlueRoute
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment template and fill in your own local values:
   ```bash
   cp .env.example .env
   ```
4. Push the schema and seed demo data:
   ```bash
   npm run db:push
   npm run db:seed
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```

See [`README.md`](./README.md) for the full setup guide and environment variable reference.

## Branch Naming

Use a prefix that describes the type of change, followed by a short, kebab-case description:

| Prefix | Use for |
|---|---|
| `feature/` | New functionality |
| `fix/` | Bug fixes |
| `refactor/` | Internal restructuring with no behavior change |
| `docs/` | Documentation-only changes |
| `chore/` | Tooling, dependencies, config |

Example: `feature/customer-credit-alerts`, `fix/ledger-balance-rounding`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short summary>
```

Common types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`.

Examples:
```
feat(shipments): add train manifest print view
fix(ledger): correct running balance after partial payment
docs(readme): update environment variable table
```

Keep the summary line under ~70 characters, written in the imperative mood ("add", not "added"). Use the body to explain *why* a change was made if it isn't obvious from the diff.

## Pull Request Process

1. Keep PRs focused — one logical change per PR.
2. Ensure `npm run lint` and `npm run build` pass locally before opening the PR.
3. Write a clear PR description: what changed, why, and how to verify it (screenshots for UI changes are appreciated).
4. Link any related issue.
5. Be responsive to review feedback — expect at least one round of review before merge.
6. Squash or clean up commit history if requested, to keep `main`'s history readable.

## Code Style

- **TypeScript everywhere** — avoid `any` where a real type is feasible.
- Follow the existing project structure: feature-scoped client components under `src/components/<feature>/`, shared primitives under `src/components/ui/`, and business logic under `src/lib/`.
- Prefer Server Components for data fetching; keep Client Components (`"use client"`) limited to interactive UI.
- Run `npm run lint` before pushing — the project uses ESLint with the Next.js config.
- Match the existing Tailwind CSS conventions and design tokens documented in [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) and [`COMPONENT_LIBRARY.md`](./COMPONENT_LIBRARY.md) rather than introducing new one-off styles.
- Validate all external input (API request bodies, form input) with Zod schemas.

## Reporting Issues

When filing a bug, include:
- Steps to reproduce
- Expected vs. actual behavior
- Environment (browser, Node version, OS)
- Screenshots or logs where relevant

Thanks for contributing!