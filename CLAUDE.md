## Commands

```bash
pnpm dev           # Start dev server with Turbopack
pnpm build         # Production build
pnpm check         # Run ESLint + TypeScript type check together
pnpm lint          # ESLint only
pnpm typecheck     # TypeScript only
pnpm format:write  # Format with Prettier

# Database
./start-database.sh   # Start local Postgres via Docker/Podman
pnpm db:push          # Push schema changes to DB (dev, no migration file)
pnpm db:generate      # Generate Drizzle migration files
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio GUI
```

## Environment

Required `.env` variables (validated at startup via `src/env.js`):
- `DATABASE_URL` — PostgreSQL connection URL
- `AUTH_SECRET` — required in production, optional in development

## Architecture

This is a **T3 Stack** app: Next.js 15 App Router + tRPC + Drizzle ORM + NextAuth v5 (beta) + Tailwind CSS v4.

### Route layout

- `src/app/(public)/` — unauthenticated pages (login, register). Each page has colocated `actions.ts` (Server Actions) and `validation.ts` (Zod schemas).
- `src/app/(protected)/` — authenticated pages (profile, settings). The layout at `(protected)/layout.tsx` enforces authentication by calling `auth()` and redirecting to `/login` if no session.
- `src/app/api/trpc/[trpc]/route.ts` — tRPC HTTP endpoint.
- `src/shared/routes.ts` — single source of truth for route path strings.

### tRPC

- Context is created in `src/server/api/trpc.ts`: injects `db` (Drizzle) and `session` (NextAuth).
- Two procedure types: `publicProcedure` and `protectedProcedure`. The protected one extracts `userId` from the session and throws `UNAUTHORIZED` if missing; it adds `ctx.userId` (string) for downstream use.
- Routers live in `src/server/api/routers/` and are registered in `src/server/api/root.ts`.
- Client-side tRPC is via `src/trpc/react.tsx` (`api` export); server-side calls use `src/trpc/server.ts`.

### Database (Drizzle + PostgreSQL)

Schema is split into files under `src/server/db/` and re-exported from `schema.ts`:
- `users-schema.ts` — NextAuth users table.
- `user-profile-schema.ts` — extended user profile.
- `packing-schema.ts` — core domain: `packingList`, `packingCategory`, `packingCatalogItem`, `packingListItem`.

`packingListItem` can be sourced from the catalog (`source: "catalog"`, `catalogItemId` set) or custom (`source: "custom"`, `catalogItemId` null). The `label` field is always denormalized onto the item row.

### Auth

NextAuth v5 beta with a Credentials provider using bcrypt password comparison. JWT strategy: user `id` is stored in the token and forwarded to `session.user.id`. No OAuth providers currently.

### Feature modules

`src/features/` contains self-contained feature slices. Each feature owns its components, Zod schemas, and TypeScript types. Currently only `packing-lists` exists.

### Shared patterns

- **Server Actions** (`actions.ts` files): validate with Zod, return `AuthActionRes` / similar typed result objects rather than throwing.
- **Form errors**: `src/lib/form-errors.ts` exports `formErrorsSetter` which maps Zod issue paths to `react-hook-form` field errors.
- **Validation files** (`validation.ts`): Zod schemas + inferred TypeScript types, imported by both the Server Action and the form component.
- **UI components**: shadcn/ui components live in `src/components/ui/`. Custom shared components are in `src/components/`.
