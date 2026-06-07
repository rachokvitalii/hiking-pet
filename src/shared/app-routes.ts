const staticAppRoutes = {
  profile: "/profile",
  settings: "/settings",
  login: "/login",
  register: "/register",
  routes: "/routes",
  recommendedRoutes: "/recommended-routes",
  assistant: "/assistant",
} as const;

function routeDetailsRoute(id: number | string): `/routes/${number | string}` {
  return `/routes/${id}`;
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
  recommendedRouteDetails: recommendedRouteDetailsRoute,
  packingList: packingListRoute,
};
