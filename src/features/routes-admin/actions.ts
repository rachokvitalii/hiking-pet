"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { appRoutes } from "~/shared/app-routes";
import { requireAdmin } from "~/server/auth/utils";
import { db } from "~/server/db";
import { routes } from "~/server/db/schema";
import { sanitizeRouteDescriptionHtml } from "~/lib/sanitize-route-html";
import { embedRouteById } from "~/server/services/routes/embed-route";
import type { Issues } from "~/types/types";
import {
  createRouteSchema,
  routeIdSchema,
  updateRouteSchema,
  type RouteFormInput,
  type UpdateRouteInput,
} from "./validation";

type PgErrorLike = {
  code?: string;
  cause?: {
    code?: string;
  };
};

export type RouteSaveActionResult =
  | { ok: true; routeId: number; embedError?: string }
  | { ok: false; issues: Issues };

export type RouteMutationActionResult =
  | { ok: true }
  | { ok: false; issues: Issues };

function getPgErrorCode(error: unknown) {
  const pgError = error as PgErrorLike;
  return pgError.code ?? pgError.cause?.code;
}

function mapRoutePersistenceError(error: unknown): Issues {
  if (getPgErrorCode(error) === "23505") {
    return [{ path: ["slug"], message: "Route with this slug already exists" }];
  }

  return [{ path: [], message: "Something went wrong. Please try again." }];
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Embedding failed";
}

function revalidateRoutePaths(routeId?: number) {
  revalidatePath(appRoutes.adminRoutes);
  revalidatePath(appRoutes.routes);

  if (routeId) {
    revalidatePath(appRoutes.adminEditRoute(routeId));
    revalidatePath(appRoutes.routeDetails(routeId));
  }
}

export async function createRouteAction(
  data: RouteFormInput,
): Promise<RouteSaveActionResult> {
  await requireAdmin();

  const parsed = createRouteSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues };
  }

  let routeId: number;

  try {
    const [createdRoute] = await db
      .insert(routes)
      .values({
        ...parsed.data,
        description: sanitizeRouteDescriptionHtml(parsed.data.description),
      })
      .returning({ id: routes.id });

    if (!createdRoute) {
      return {
        ok: false,
        issues: [{ path: [], message: "Route was not created." }],
      };
    }

    routeId = createdRoute.id;
  } catch (error) {
    return { ok: false, issues: mapRoutePersistenceError(error) };
  }

  try {
    await embedRouteById(routeId);
    revalidateRoutePaths(routeId);
    return { ok: true, routeId };
  } catch (error) {
    revalidateRoutePaths(routeId);
    return { ok: true, routeId, embedError: getErrorMessage(error) };
  }
}

export async function updateRouteAction(
  data: UpdateRouteInput,
): Promise<RouteSaveActionResult> {
  await requireAdmin();

  const parsed = updateRouteSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues };
  }

  const { id, ...routeData } = parsed.data;

  try {
    const [updatedRoute] = await db
      .update(routes)
      .set({
        ...routeData,
        description: sanitizeRouteDescriptionHtml(routeData.description),
        updatedAt: new Date(),
      })
      .where(eq(routes.id, id))
      .returning({ id: routes.id });

    if (!updatedRoute) {
      return {
        ok: false,
        issues: [{ path: [], message: "Route was not found." }],
      };
    }
  } catch (error) {
    return { ok: false, issues: mapRoutePersistenceError(error) };
  }

  try {
    await embedRouteById(id);
    revalidateRoutePaths(id);
    return { ok: true, routeId: id };
  } catch (error) {
    revalidateRoutePaths(id);
    return { ok: true, routeId: id, embedError: getErrorMessage(error) };
  }
}

export async function deleteRouteAction(
  id: number,
): Promise<RouteMutationActionResult> {
  await requireAdmin();

  const parsed = routeIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues };
  }

  try {
    await db.delete(routes).where(eq(routes.id, parsed.data.id));
    revalidateRoutePaths(parsed.data.id);
    return { ok: true };
  } catch {
    return {
      ok: false,
      issues: [{ path: [], message: "Route could not be deleted." }],
    };
  }
}

export async function reEmbedRouteAction(
  id: number,
): Promise<RouteMutationActionResult> {
  await requireAdmin();

  const parsed = routeIdSchema.safeParse({ id });

  if (!parsed.success) {
    return { ok: false, issues: parsed.error.issues };
  }

  try {
    await embedRouteById(parsed.data.id);
    revalidateRoutePaths(parsed.data.id);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      issues: [{ path: [], message: getErrorMessage(error) }],
    };
  }
}
