import { ButtonBack } from "~/components/button-back";
import { api } from "~/trpc/server";
import { routes as staticRoutes } from "~/shared/routes";
import { RouteCard } from "~/features/routes/components/route-card";

export default async function RecommendedRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recommendationId = Number(id);
  const recommendations = await api.ai.getRecommendedRoutes({ recommendationId });

  return (
    <>
      <div className="space-y-4">
        <ButtonBack href={staticRoutes.recommendedRoutes} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map((route) => {
          return (
            <RouteCard key={route.id} route={route} />
          );
        })}
      </div>
    </>
  );
}