## Context

See proposal.md for motivation. Today routes live in Postgres (`routes` with `pgvector` embedding columns), are seeded via CLI, and embeddings are refreshed by `pnpm db:embed:routes` (`embed-routes.ts` + `embedding-documents.ts`). Auth is NextAuth credentials + JWT with only `user.id` on the session; `(protected)/layout.tsx` checks authentication only. No admin UI or user roles exist.

The admin CRUD/roles/embed path is already implemented; this revision replaces the Markdown textarea with a rich-text editor and strips markup before embedding.

Constraints: stay inside the T3 stack (App Router, Drizzle, NextAuth, Zod, Server Actions / tRPC patterns already used elsewhere); reuse existing embedding document hashing; embedding documents MUST use plain text (HTML stripped from `description`).

## Goals / Non-Goals

**Goals:**

- Role-gated admin area for route CRUD with rich-text description (text styles, no images) and slug UX
- Shared `embedRouteById` used by save path, Re-embed UI, and existing batch CLI
- Embedding document and source hash use tag-stripped plain text from `description`
- Route detail views render sanitized HTML, not raw tags
- Save always persists route content; embedding failure is recoverable without re-entering the form
- Server-enforced admin authorization on pages and mutations

**Non-Goals:**

- Job queue / async workers for embeddings (sync call is enough for single-route save)
- Multi-role RBAC beyond `user` | `admin`
- Image insert, upload, or object storage (next change)
- Replacing seed/batch CLI entirely (they remain for backfill)

## Decisions

### 1. Roles: enum column on `users`

- Add `role` as `pgEnum('user_role', ['user', 'admin'])` with default `user`.
- Put `role` on the JWT at login (`authorize` + `jwt` callback) and expose on `session.user.role`.
- **Alternative considered:** separate `admin_users` table — deferred; single column is enough for two roles.

### 2. Bootstrap: `pnpm db:promote-admin <email>`

- CLI updates `users.role = 'admin'` for the given email.
- Operator promotes their own account after register/login; no in-app “make me admin” button in MVP.
- **Alternative considered:** env email whitelist at runtime — harder to reason about in multi-env; CLI is explicit.

### 3. Route group `(admin)` with nested authz

- Paths under `/admin/*` (e.g. `/admin/routes`, `/admin/routes/new`, `/admin/routes/[id]/edit`).
- Layout: `auth()` → redirect login if missing; if `role !== 'admin'` → redirect to a safe app page (e.g. `/routes`) or 404.
- Register paths in `src/shared/app-routes.ts`.
- Header shows Admin link only when `session.user.role === 'admin'`.

### 4. Mutations: Server Actions colocated with admin pages

- Prefer Server Actions + Zod validation (same pattern as login/register) for create/update/delete/re-embed.
- Each action re-checks admin role server-side (defense in depth beyond layout).
- Keep public/protected `routes` tRPC read APIs as-is; admin writes stay separate.

### 5. Embedding: extract `embedRouteById`, fail soft on save

```
create/update action
  -> validate + persist route fields (HTML description stored as-is after sanitization)
  -> try embedRouteById(id)
       success: set embedding, model, sourceHash, updatedAt
       failure: leave embedding columns unchanged (null or previous); return { saved: true, embedError }
  -> UI shows toast + Re-embed when embed failed or embedding missing/stale
```

- Re-embed action: admin-only, loads row, embeds, returns success/error.
- Batch CLI calls the same shared helper (or filters and loops it).
- `buildRouteEmbeddingDocument` still includes title, description, region, enums, metrics — not description-only.
- Description in that document is `htmlToPlainText(description)`: strip tags, decode entities, drop image content. Source hash is computed from this plain-text document so markup-only edits do not invalidate embeddings.

### 6. Slug: auto from title, manual override

- Client: derive slug from title while the slug field is “untouched”; once the user edits slug, stop auto-updating.
- Server: validate format + unique constraint; return field error on conflict.

### 7. Rich-text editor (TipTap), no images

- Store sanitized HTML in `routes.description` (existing `text` column; no schema change).
- Use **TipTap** in the admin form: bold, italic, headings, lists, links. Do not enable Image (or any media) extensions in this change.
- Sanitize on write (allowlist of tags/attrs for those styles). Strip `img` if pasted.
- Route cards/detail pages render sanitized HTML so users see formatted text, not source tags. Existing seed descriptions without tags keep rendering as plain text.
- **Alternative considered:** `@uiw/react-md-editor` — Markdown-first, weaker fit for styled HTML. Deferred image upload to a later change.

### 8. Delete

- Confirm dialog; DB cascades `route_recommendation_items` via existing FK.
- Soft-delete out of scope.

## Risks / Trade-offs

- **[Risk] Sync embed adds latency on save** → Mitigation: show loading state; soft-fail keeps UX usable; batch CLI for bulk.
- **[Risk] JWT role stale after promote** → Mitigation: document re-login after `db:promote-admin`; optional later: refresh role from DB in `jwt` callback.
- **[Risk] Accidental delete of recommended routes’ items** → Mitigation: confirm copy mentioning impact; cascade is intentional.
- **[Risk] Stored HTML XSS** → Mitigation: sanitize on write and when rendering; no images in this change.
- **[Trade-off] No job queue** → simpler MVP; revisit if OpenAI timeouts become common.
- **[Trade-off] Seed Markdown/plain descriptions** → they remain valid HTML-less text and still embed/display correctly.

## Migration Plan

1. Generate/apply Drizzle migration for `user_role` enum + `users.role` (default `user`).
2. Deploy app with admin routes (no admins yet → area unreachable).
3. Run `pnpm db:promote-admin <email>`, re-login, verify CRUD + embed.
4. Rich-text follow-up: no DB migration; existing `description` values stay valid. Re-embed is only needed if hash input changes after strip helper lands (markup-only vs previous raw HTML in the document).
5. Rollback: remove admin UI / revert migration only if needed; promoting admin is reversible with SQL `role = 'user'`.

## Open Questions

- Whether non-admin hitting `/admin` gets soft redirect or not-found (prefer redirect to `/routes` for quieter UX).
