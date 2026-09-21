## Why

Admins can already write rich-text route descriptions, but they cannot include photos. The previous routes-admin change deferred image insert on purpose. Route pages need inline images now, without waiting for a media library or cover photos.

## What Changes

- Add an image-insert control to the route description editor (toolbar button only; no paste or drop in this change)
- Upload the selected file through this app's admin server path into Vercel Blob (`put`, not the Vercel client upload SDK) and persist it as an `<img>` in the stored description HTML. The file MUST go through our server so the app can be hosted somewhere other than Vercel.
- Accept JPEG, PNG, and WebP files up to 5 MB; reject anything else before the image is inserted
- Show those images on the route detail page; keep list/card previews text-only
- Allow stored `<img>` tags only when `src` points at this app's Vercel Blob host; strip any other image source on save and on render
- Delete Blob files that belong to a description when the route is deleted, and when a save removes those image URLs from the HTML
- Keep embeddings on plain text: image content still MUST NOT enter the embedding document

Out of scope: cover/hero images, a media gallery, reuse of one upload across routes, paste/drop upload, client-side compression, tracking or deleting uploads that were never saved.

## Capabilities

### New Capabilities

### Modified Capabilities

- `routes-admin`: Replace the "no image insert / do not render images" rules with toolbar upload to Vercel Blob, detail-page rendering, size/type limits, host-restricted sanitization, and Blob cleanup on route delete and on save when images leave the description.

## Impact

- Admin TipTap editor, description sanitizer, and route detail/card rendering
- Admin-only upload Route Handler and `IMAGE_READ_WRITE_TOKEN` (plus optional `IMAGE_STORE_ID`, and `@vercel/blob` `put` / `del`). Do not use `@vercel/blob/client`; the browser posts the file to this app, then the server writes to Blob.
- Route create/update/delete actions: persist HTML with images, clean up Blob objects that this description no longer uses
- No schema change to `routes`; description remains HTML text
- Embedding pipeline unchanged in behavior (still strips images)
