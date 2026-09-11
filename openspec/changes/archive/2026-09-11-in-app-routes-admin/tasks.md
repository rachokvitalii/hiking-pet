## 1. Roles & auth

- [x] 1.1 Add `user_role` enum and `users.role` (default `user`) in Drizzle schema; generate migration and verify `pnpm db:generate` / migrate applies cleanly
- [x] 1.2 Extend NextAuth types + `authorize` / `jwt` / `session` callbacks so `session.user.role` is set; verify typed session after login shows `user` or `admin`
- [x] 1.3 Add `pnpm db:promote-admin <email>` script that sets role to `admin` or fails on unknown email; verify promote + re-login reflects `admin` in session
- [x] 1.4 Add shared server helper `requireAdmin()` (or equivalent) used by admin layout and mutations; verify non-admin callers are rejected

## 2. Embedding service extract

- [x] 2.1 Extract `embedRouteById(routeId)` from batch `embed-routes.ts` using existing `buildRouteEmbeddingDocument` / hash helpers; verify batch CLI still updates stale routes
- [x] 2.2 Ensure embed failure throws/returns without mutating route content columns; verify failed embed leaves `embedding*` unchanged

## 3. Admin shell & navigation

- [x] 3.1 Add `appRoutes` entries for `/admin/routes`, new, and edit; verify path helpers compile
- [x] 3.2 Create `(admin)/layout.tsx` that requires auth + `admin` role (redirect non-admins to `/routes`); verify admin can open, non-admin cannot
- [x] 3.3 Show Admin nav link in Header only for admins; verify visibility for both roles

## 4. Route validation & Server Actions

- [x] 4.1 Add Zod schema for route create/update (all domain fields + slug rules) and slugify helper; verify invalid payloads fail validation
- [x] 4.2 Implement admin Server Actions: create, update, delete, reEmbed — each calls `requireAdmin()`; verify unauthorized rejection
- [x] 4.3 Wire create/update to persist content then call `embedRouteById`; on embed failure return saved + embed error without rolling back content; verify both success and soft-fail paths
- [x] 4.4 Implement delete with confirmation contract (action only deletes); verify route row removed and cascade behavior acceptable

## 5. Admin UI

- [x] 5.1 Build admin routes list page (title, slug, embedding status hint, actions); verify it lists DB routes for an admin
- [x] 5.2 Build create/edit form with all fields, auto-slug until manual override, and Markdown editor for description; verify slug UX and Markdown round-trip on save
- [x] 5.3 Add Re-embed control on edit (and/or list) that calls reEmbed action and surfaces success/error; verify recovery after intentional embed failure
- [x] 5.4 Add delete confirmation UI; verify cancel keeps route, confirm removes it

## 6. Verification

- [x] 6.1 Run `pnpm check` and fix type/lint issues introduced by this change
- [x] 6.2 Manual smoke: promote admin → CRUD route → confirm embed columns set → force embed failure path → Re-embed succeeds

## 7. Rich-text description

- [x] 7.1 Replace admin description field with TipTap (bold/italic/headings/lists/links, no image); sanitize HTML on save; verify HTML round-trip and no image control
- [x] 7.2 Add `htmlToPlainText` and use it in `buildRouteEmbeddingDocument` + source hash; verify tags/images do not appear in the embedding document
- [x] 7.3 Render sanitized HTML on route detail (and list cards that show description); verify formatted text, not raw tags; seed plain text still displays
- [x] 7.4 Run `pnpm check` and fix issues from this revision
