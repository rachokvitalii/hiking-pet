import "server-only";

import { del } from "@vercel/blob";

import { env } from "~/env";

export async function deleteDescriptionImageBlobs(urls: string[]) {
  if (urls.length === 0) {
    return;
  }

  try {
    await del(
      urls,
      env.IMAGE_READ_WRITE_TOKEN as string
        ? { token: env.IMAGE_READ_WRITE_TOKEN as string }
        : undefined,
    );
  } catch (error) {
    console.error("Failed to delete description image blobs", error);
  }
}
