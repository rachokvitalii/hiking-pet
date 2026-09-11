const staticAppRoutes = {
  profile: "/profile",
  settings: "/settings",
  login: "/login",
  register: "/register",
  routes: "/routes",
  recommendedRoutes: "/recommended-routes",
  assistant: "/assistant",
  adminRoutes: "/admin/routes",
  adminNewRoute: "/admin/routes/new",
} as const;

function routeDetailsRoute(id: number | string): `/routes/${number | string}` {
  return `/routes/${id}`;
}

function adminEditRoute(
  id: number | string,
): `/admin/routes/${number | string}/edit` {
  return `/admin/routes/${id}/edit`;
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
  adminEditRoute,
  recommendedRouteDetails: recommendedRouteDetailsRoute,
  packingList: packingListRoute,
};
