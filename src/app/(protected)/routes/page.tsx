import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { api } from "~/trpc/server";
import { RouteIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { GetRecommendation } from "~/features/routes/components/get-recommendation";
import { getRecommendationId } from "~/features/routes/utils/get-recommendation-id";
import { ButtonBack } from "~/components/button-back";
import { routes as staticRoutes } from "~/shared/routes";

export default async function RoutesPage({
  searchParams,
}: {
  searchParams: Promise<{ recommendation?: string }>;
}) {
  const t = await getTranslations("actions");
  const tRoute = await getTranslations("routes");
  const recommendationId = await getRecommendationId(searchParams);

  const routes = recommendationId
    ? await api.routes.getRecommendation({ recommendationId })
    : await api.routes.getAll();

  return (
    <>
      {recommendationId ? (
        <ButtonBack href={staticRoutes.routes} text={t("backToRoutes")} />
      ) : <GetRecommendation />}
      <div className="grid gap-4 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <CardTitle>{route.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{route.description}</p>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <RouteIcon className="h-4 w-4" />
                {tRoute("units.kilometers", { value: route.distanceKm })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {tRoute(`difficulty.${route.difficulty}`)}
                </Badge>
                {route.type.map((type) => (
                  <Badge key={type} variant="outline">
                    {tRoute(`types.${type}`)}
                  </Badge>
                ))}
              </div>
              {route.recommendation?.reason && (
                <div className="bg-muted/30 rounded-md border px-3 py-2 text-sm">
                  {route.recommendation.reason}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button asChild>
                <Link
                  href={
                    recommendationId
                      ? `${staticRoutes.routes}/${route.id}?recommendation=${recommendationId}`
                      : `${staticRoutes.routes}/${route.id}`
                  }
                >
                  {t("view")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
