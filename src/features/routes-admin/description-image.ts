export const DESCRIPTION_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const DESCRIPTION_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type DescriptionImageContentType =
  (typeof DESCRIPTION_IMAGE_ALLOWED_TYPES)[number];

export const DESCRIPTION_IMAGE_ACCEPT =
  DESCRIPTION_IMAGE_ALLOWED_TYPES.join(",");

export const DESCRIPTION_IMAGE_UPLOAD_PATH = "/api/admin/description-image";

export function isAllowedDescriptionImageType(
  type: string,
): type is DescriptionImageContentType {
  return (DESCRIPTION_IMAGE_ALLOWED_TYPES as readonly string[]).includes(type);
}
