## Context

See proposal.md for motivation and `specs/routes-admin/spec.md` for behavior.

Today the admin route form uses TipTap with an image toolbar that uploads via `@vercel/blob/client` (`handleUpload` at `src/app/api/admin/description-image/route.ts`). Description HTML is stored in `routes.description`. `sanitizeRouteDescriptionHtml` allowlists styled tags plus Blob-host `img`. Route detail and cards render through `RouteDescription`. Embeddings run `htmlToPlainText`, which drops `img`.

Constraints: stay in the T3 App Router stack; admin writes stay Server Actions / Route Handlers + `requireAdmin()`; no `routes` schema change; embedding behavior stays plain-text; the upload path MUST work when the Next.js app is hosted somewhere other than Vercel. Storage remains Vercel Blob (`IMAGE_READ_WRITE_TOKEN` + optional `IMAGE_STORE_ID` + `put` / `del`).

## Goals / Non-Goals

**Goals:**

- Server-side `put()` so the browser sends the file only to this app, not through `@vercel/blob/client` (that path is not viable when the app is hosted off Vercel)
- Server-owned URL set-diff cleanup on save and delete (editor never deletes Blob objects)
- Host-restricted `img` allowlist in the existing sanitizer
- Card previews strip images without changing the stored HTML

**Non-Goals:**

- Parsing stored HTML into `next/image` components
- A media table, pathname prefix per route, or draft-id to reclaim unsaved uploads
- Browser-side image compression or resizing

## Decisions

### 1. Server `put()` via an admin Route Handler

- Toolbar opens a hidden file input (`accept` JPEG/PNG/WebP). Client checks `file.size <= 5 * 1024 * 1024` and MIME type, then `POST`s `FormData` to the app (e.g. `src/app/api/admin/description-image/route.ts`).
- The Route Handler calls `requireAdmin()`, re-checks type and 5 MB, then `put()` from `@vercel/blob` with `access: 'public'` and `addRandomSuffix: true`. Unique URL, no reuse, no gallery.
- Response is `{ url }`. The editor `setImage({ src: url })`.
- Env: `IMAGE_READ_WRITE_TOKEN` (required in production, optional in development) and optional `IMAGE_STORE_ID` on the server schema in `src/env.ts`. Token is what `put` / `del` use. No `@vercel/blob/client`, no `handleUpload` token flow.
- **Alternative considered:** `@vercel/blob/client` (`upload` + `handleUpload`) — rejected. The browser talks to Vercel’s client upload pipeline, which is not viable when this app runs on other hosts. File bytes MUST enter Blob only after they have gone through this app’s server. The 5 MB product cap is unchanged and is not why client upload was dropped.

### 2. TipTap Image, toolbar only

- Add `@tiptap/extension-image`. Toolbar button triggers the file input; on a successful response from the upload Route Handler, `setImage({ src: url })`.
- Do not add an image-URL prompt (unlike the existing link `window.prompt`).
- Disable file paste/drop: do not wire upload to `handlePaste` / `handleDrop`, and configure the Image extension so dropped/pasted files are not inserted. Foreign `<img>` HTML that still arrives in the document is stripped on save by sanitization.
- **Alternative considered:** paste/drop in this change — deferred; extra handlers and a common source of oversized phone photos.

### 3. HTML is the inventory; cleanup is a URL set-diff on the server

- No media rows. Identity of a file is its Blob URL inside `description`.
- Shared helper: extract `img src` values that pass the object-storage host check; compare as sets (`vanished = oldUrls - newUrls`); `del(vanished)` from `@vercel/blob`.
- **Update:** load previous `description`, sanitize + persist new HTML, then attempt `del(vanished)`. Reorder keeps the same set → delete nothing. Create has no previous URLs → delete nothing.
- **Delete:** read `description`, delete the route row, then attempt `del(all referenced Blob URLs)`. Database delete is the source of truth; Blob failure must not restore the row (same soft-fail idea as embeddings).
- Do not delete Blob objects from the editor on click (Cancel/Undo still need the file until save).
- **Alternative considered:** media table + refcount — that is a gallery. Prefix `routes/{id}/` — upload on create happens before `id` exists.

### 4. Sanitize: allow `img` only from the Blob host

- Extend `sanitizeRouteDescriptionHtml`: allow `img` with `src` and `alt`; `https` only; drop the tag unless hostname is the Vercel Blob public host (`*.public.blob.vercel-storage.com`). A host-override argument exists on the helper for a later custom Blob domain; it is not an env var in this change.
- Run on write (actions) and on render (`RouteDescription`). The sanitizer cannot see “user clicked upload”; it only sees the HTML string, which is why the host check exists.
- **Alternative considered:** allow any `https` `src` — would persist hotlinked/pasted third-party images. Rejected.

### 5. Cards strip images; detail shows them

- `RouteDescription` with `clamp` (list/recommendation cards): after sanitize, remove `img` so `line-clamp` cannot show broken/cropped photos. Stored HTML is unchanged.
- Detail (`clamp` false): keep allowed `img` and add description CSS for images (`max-width: 100%`).
- Keep native `<img>` in HTML. `next/image` does not apply to `dangerouslySetInnerHTML` without an HTML-to-React pipeline.
- **Alternative considered:** hide images with CSS on cards — still loads the bytes. Stripping the tag avoids that.

### 6. Embeddings unchanged

- Keep `htmlToPlainText` (already drops `img`). Markup-only or image-only edits still do not change embedding text unless visible text changes.
- **Alternative considered:** include `alt` in the embedding document — out of scope; no alt requirement in this change.

## Risks / Trade-offs

- **[Risk] Admin upload Route Handler abused** → Mitigation: `requireAdmin()` plus type and 5 MB checks on the server before `put()`.
- **[Risk] Stored HTML XSS via `img`** → Mitigation: tag/attr allowlist, `https` only, Blob host check on save and render; no `onerror` / event attrs.
- **[Risk] Copying a Blob URL into another route, then deleting the first route, breaks the second** → Mitigation: unsupported without a gallery; unique suffix makes accidental sharing rare.
- **[Risk] Unsaved uploads (file chosen on `/admin/routes/new`, tab closed)** → Mitigation: accepted orphans; no draft tracking in this change.
- **[Risk] Blob `del` fails after DB save/delete** → Mitigation: do not roll back route content; leftover objects are orphans, same class as unsaved uploads.
- **[Trade-off] Native `<img>` instead of `next/image`** → simpler pipeline for stored HTML; no automatic srcset. Revisit if a renderer is introduced later.

## Migration Plan

1. Add `IMAGE_READ_WRITE_TOKEN` (and Blob store; optional `IMAGE_STORE_ID`) in each deployed environment, including local `.env`.
2. Replace the client `handleUpload` route with a `FormData` + `put()` handler; keep sanitizer, editor insert, and cleanup. Existing Blob URLs in descriptions stay valid.
3. Rollback: revert the release. Blob objects already uploaded remain until deleted manually; rows still contain HTML `img` tags that the old sanitizer would strip on render (images disappear from the UI but files remain in Blob).

## Open Questions

None. Host matching uses the standard `*.public.blob.vercel-storage.com` suffix. A custom Blob domain can later pass a host override into the helper without changing specs.
