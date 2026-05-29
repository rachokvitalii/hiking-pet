const staticRoutes = {
  profile: "/profile",
  settings: "/settings",
  login: "/login",
  register: "/register",
  routes: "/routes",
} as const;

export function packingListRoute(id: number): `/packing-lists/${number}` {
  return `/packing-lists/${id}`;
}

export const routes = {
  ...staticRoutes,
  packingList: packingListRoute,
};
