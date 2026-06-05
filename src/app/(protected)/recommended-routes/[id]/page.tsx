import { ButtonBack } from "~/components/button-back";
import { api } from "~/trpc/server";
import { appRoutes } from "~/shared/app-routes";
import { RouteCard } from "~/features/routes/components/route-card";

export default async function RecommendedRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recommendationId = Number(id);
  const recommendations = await api.aiRecommendations.getRecommendedRoutes({
    recommendationId,
  });

  return (
    <>
      <div className="space-y-4">
        <ButtonBack href={appRoutes.recommendedRoutes} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {recommendations.map((route) => {
          return <RouteCard key={route.id} route={route} />;
        })}
      </div>
    </>
  );
}
