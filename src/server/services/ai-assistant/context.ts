import "server-only";

import { eq } from "drizzle-orm";

import { db } from "~/server/db";
import { userProfile } from "~/server/db/schema";
import {
  retrieveAssistantRouteContexts,
  type AssistantRouteRetrievalContext,
} from "./route-retrieval";

type AssistantUserProfileContext = {
  homeRegion: string | null;
  experienceLevel: string | null;
  preferredTripDuration: string | null;
  maxDailyKm: number | null;
};

export async function buildAssistantContext({
  routeSearchQuery,
  userId,
}: {
  routeSearchQuery: string;
  userId: number;
}) {
  const [profile = null] = await db
    .select({
      homeRegion: userProfile.homeRegion,
      experienceLevel: userProfile.experienceLevel,
      preferredTripDuration: userProfile.preferredTripDuration,
      maxDailyKm: userProfile.maxDailyKm,
    })
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .limit(1);

  const routeRetrieval = await retrieveAssistantRouteContexts({
    query: routeSearchQuery,
  });

  return formatAssistantContext({
    routeRetrieval,
    userProfile: profile,
  });
}

function formatAssistantContext(context: {
  routeRetrieval: AssistantRouteRetrievalContext;
  userProfile: AssistantUserProfileContext | null;
}) {
  return ["Current application data:", JSON.stringify(context, null, 2)].join(
    "\n",
  );
}
