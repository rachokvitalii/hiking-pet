const staticAppRoutes = {
  profile: "/profile",
  settings: "/settings",
  login: "/login",
  register: "/register",
  routes: "/routes",
  recommendedRoutes: "/recommended-routes",
} as const;

function routeDetailsRoute(id: number | string): `/routes/${number | string}` {
  return `/routes/${id}`;
}

function routesWithRecommendationRoute(
  recommendationId: number | string,
): `/routes?recommendation=${number | string}` {
  return `/routes?recommendation=${recommendationId}`;
}

function recommendedRouteDetailsRoute(
  id: number | string,
): `/recommended-routes/${number | string}` {
  return `/recommended-routes/${id}`;
}

function packingListRoute(
  id: number | string,
): `/packing-lists/${number | string}` {
  return `/packing-lists/${id}`;
}

export const appRoutes = {
  ...staticAppRoutes,
  routeDetails: routeDetailsRoute,
  routesWithRecommendation: routesWithRecommendationRoute,
  recommendedRouteDetails: recommendedRouteDetailsRoute,
  packingList: packingListRoute,
};
