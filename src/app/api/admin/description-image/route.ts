import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { env } from "~/env";
import {
  DESCRIPTION_IMAGE_MAX_BYTES,
  isAllowedDescriptionImageType,
} from "~/features/routes-admin/description-image";
import { requireAdmin } from "~/server/auth/utils";

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 401 },
    );
  }

  if (!env.IMAGE_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Blob storage is not configured" },
      { status: 500 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  if (!isAllowedDescriptionImageType(file.type)) {
    return NextResponse.json(
      { error: "Use a JPEG, PNG, or WebP image" },
      { status: 400 },
    );
  }

  if (file.size > DESCRIPTION_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be 5 MB or smaller" },
      { status: 400 },
    );
  }

  const pathname = file.name.trim() || "image";

  try {
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: true,
      token: env.IMAGE_READ_WRITE_TOKEN as string,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image upload failed";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
