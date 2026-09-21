## 1. Dependencies & env

- [x] 1.1 Add `@vercel/blob` and `@tiptap/extension-image`; verify install succeeds and both packages resolve in the app
- [x] 1.2 Add `IMAGE_READ_WRITE_TOKEN` and optional `IMAGE_STORE_ID` to the server env schema (`src/env.ts` / `src/env.js`) and document them for local/prod; verify `pnpm typecheck` passes with the token present

## 2. Sanitize & Blob URL helpers

- [x] 2.1 Allow `img` (`src`, `alt`) in `sanitizeRouteDescriptionHtml` only for `https` URLs on the Vercel Blob public host; verify a Blob-host `img` is kept and a foreign `src` is stripped
- [x] 2.2 Add helpers to extract Blob-host `img` URLs from HTML and compute `vanished = oldUrls - newUrls`; verify reordering yields an empty vanished set and removing one of several URLs lists only that URL

## 3. Admin upload route

- [x] 3.1 Replace `handleUpload` with a `FormData` POST Route Handler that calls `requireAdmin()`, checks JPEG/PNG/WebP and 5 MB, then `put()` from `@vercel/blob` (`access: 'public'`, `addRandomSuffix`); verify a non-admin request is rejected and no Blob object is created
- [x] 3.2 Reject disallowed type and oversized files on the server before `put()`; verify those uploads do not store a file
- [x] 3.3 Remove `@vercel/blob/client` from the upload path; verify the app has no `handleUpload` / client `upload()` usage

## 4. Description editor

- [x] 4.1 POST the chosen file as `FormData` to the admin upload route and `setImage({ src })` from the JSON `{ url }` on success; verify an allowed file appears as an image in the editor
- [x] 4.2 Client-check type and 5 MB before upload and surface an error without inserting; verify oversized and non-JPEG/PNG/WebP files are not inserted
- [x] 4.3 Do not upload or insert on paste/drop of image files; verify pasting or dropping a file does not create a Blob object or an editor image

## 5. Save, delete, and Blob cleanup

- [x] 5.1 Keep sanitizing description on create/update so foreign `img` never persist; verify saved HTML omits non-Blob `img` and includes allowed Blob `img`
- [x] 5.2 On update, persist sanitized HTML first, then `del(vanished)` without rolling back the row if `del` fails; verify removing an image deletes that Blob object, reordering does not, and a forced `del` failure still leaves the new description saved
- [x] 5.3 On delete, read description URLs, delete the route row, then attempt `del` of those URLs; verify the row is gone even if Blob deletion fails, and a successful path removes the referenced objects

## 6. Public rendering

- [x] 6.1 Show allowed images on route detail via existing `RouteDescription` (native `img`, max-width CSS); verify the detail page displays the photo, not raw `img` markup
- [x] 6.2 When `clamp` is true (list/recommendation cards), strip `img` after sanitize without changing stored HTML; verify cards show text only and the detail page still shows images

## 7. Embeddings

- [x] 7.1 Confirm `htmlToPlainText` still drops `img` (and their URLs) before `buildRouteEmbeddingDocument`; verify an image-only markup change does not change embedding source text

## 8. Verification

- [x] 8.1 Run `pnpm check` and fix lint/type issues introduced by the server-upload rewrite
- [x] 8.2 Manual smoke: admin uploads JPEG/PNG/WebP ≤5 MB → save → image on detail, not on cards → reject oversize/wrong type → save after removing an image deletes Blob → delete route deletes remaining Blobs → non-admin cannot upload
