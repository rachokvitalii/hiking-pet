
import { api } from "~/trpc/server";
import { GetRecommendation } from "~/features/routes/components/get-recommendation";
import { RouteCard } from "~/features/routes/components/route-card";

export default async function RoutesPage() {
  const routes = await api.routes.getAll();

  return (
    <>
      <GetRecommendation />
      <div className="grid gap-4 lg:grid-cols-3">
        {routes.map((route) => {
          return (
            <RouteCard key={route.id} route={route} />
          );
        })}
      </div>
    </>
  );
}
