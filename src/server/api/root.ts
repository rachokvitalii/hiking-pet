import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { profileRouter } from "./routers/profile";
import { packingListsRouter } from "./routers/packing-lists";
import { gearCatalogRouter } from "./routers/gear-catalog";
import { routesRouter } from "./routers/routes";
import { aiRecommendationRoute } from "./routers/ai-recommendations";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  profile: profileRouter,
  packingLists: packingListsRouter,
  gearCatalog: gearCatalogRouter,
  routes: routesRouter,
  aiRecommendations: aiRecommendationRoute,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
