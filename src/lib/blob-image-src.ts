const VERCEL_BLOB_PUBLIC_HOST = "public.blob.vercel-storage.com";
const VERCEL_BLOB_PUBLIC_HOST_SUFFIX = `.${VERCEL_BLOB_PUBLIC_HOST}`;

export function isAllowedBlobImageSrc(src: string, hostOverride?: string) {
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") {
      return false;
    }

    if (
      url.hostname === VERCEL_BLOB_PUBLIC_HOST ||
      url.hostname.endsWith(VERCEL_BLOB_PUBLIC_HOST_SUFFIX)
    ) {
      return true;
    }

    return Boolean(hostOverride && url.hostname === hostOverride);
  } catch {
    return false;
  }
}
