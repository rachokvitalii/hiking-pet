## Why

Routes today are seeded via CLI (`pnpm db:seed:routes`) and embeddings are a separate batch job (`pnpm db:embed:routes`). Admins need an in-app way to create and maintain hiking routes in Postgres and refresh embeddings without leaving the product or syncing an external CMS.

## What Changes

- Add a `role` field on users (`user` | `admin`) and carry it in the NextAuth JWT/session
- Provide a CLI script to promote a user (by email) to `admin` for bootstrap
- Add a protected `(admin)` route group with layout that requires both authentication and `admin` role
- Add admin UI for full route CRUD: list, create, edit, delete (with confirmation)
- Route form covers all domain fields; `description` uses a rich-text editor with text styles (bold, italic, headings, lists, links); `slug` auto-generates from title and remains manually editable
- Persist description as HTML (no images in this change); before embedding, strip markup and pass plain text into the embedding document
- After successful create/update, attempt embedding immediately; on embed failure keep the route row (all form fields) without updating embedding columns and expose a **Re-embed** action
- Enforce authorization on the server for all admin mutations and pages (not UI-only)

## Capabilities

### New Capabilities

- `user-roles`: User role model, session exposure, server-side admin checks, and admin promotion bootstrap
- `routes-admin`: In-app admin CRUD for routes, rich-text description editing, slug behavior, and post-save / on-demand embedding from plain-text descriptions

### Modified Capabilities

- (none — no existing main specs under `openspec/specs/` yet)

## Impact

- **DB**: `users.role` column + Drizzle migration; existing routes schema unchanged (`description` remains `text`; embedding columns already present)
- **Auth**: NextAuth callbacks and type augmentation for `role`; new admin layout guard
- **App routes**: new `/admin/routes` paths in `app-routes`; nav link visible only to admins
- **API**: new Server Actions and/or tRPC admin mutations for route CRUD + re-embed; reuse / extract `embedRouteById` from `embed-routes.ts`; shared helper to strip HTML to plain text for embedding + source hash
- **UI**: new `src/features/routes-admin` with list, form, and a rich-text editor (TipTap or equivalent)
- **Ops**: `pnpm db:promote-admin` (or equivalent) for first admin; keep `db:embed:routes` for batch backfill
- **Out of scope**: audit log, draft/publish, images/upload/media/GPX, bulk import, i18n content
