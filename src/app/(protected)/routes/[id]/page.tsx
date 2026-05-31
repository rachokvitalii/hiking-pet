import {
  CalendarDaysIcon,
  MapPinIcon,
  MountainIcon,
  RouteIcon,
  TrendingUpIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { routes as staticRoutes } from "~/shared/routes";
import { ButtonBack } from "~/components/button-back";
import { api } from "~/trpc/server";
import type { TripType } from "~/types/types";
import { getRecommendationId } from "~/features/routes/utils/get-recommendation-id";

export default async function RoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ recommendation?: string }>;
}) {
  const { id } = await params;
  const recommendationId = await getRecommendationId(searchParams);
  const backHref = recommendationId
    ? `${staticRoutes.routes}?recommendation=${recommendationId}`
    : staticRoutes.routes;

  const route = await api.routes.getById({ id: Number(id) });

  const tRoute = await getTranslations("routes");

  if (!route) {
    notFound();
  }

  const stats = [
    {
      label: tRoute("labels.distance"),
      value: tRoute("units.kilometers", { value: route.distanceKm }),
      icon: RouteIcon,
    },
    {
      label: tRoute("labels.duration"),
      value: tRoute("units.days", { count: route.days }),
      icon: CalendarDaysIcon,
    },
    {
      label: tRoute("labels.elevationGain"),
      value: tRoute("units.meters", { value: route.elevationGain }),
      icon: TrendingUpIcon,
    },
    {
      label: tRoute("labels.region"),
      value: route.region,
      icon: MapPinIcon,
    },
  ];

  return (
    <div className="space-y-4">
      <ButtonBack href={backHref} />

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {tRoute(`difficulty.${route.difficulty}`)}
            </Badge>
            {route.type.map((type: TripType) => (
              <Badge key={type} variant="outline">
                {tRoute(`types.${type}`)}
              </Badge>
            ))}
          </div>

          <div className="space-y-2">
            <CardTitle className="text-2xl leading-tight">
              {route.title}
            </CardTitle>
            <CardDescription className="text-base">
              {route.description}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="bg-muted/30 flex min-h-24 items-center gap-3 rounded-lg border p-4"
                >
                  <div className="bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-md">
                    <Icon className="text-muted-foreground h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="text-muted-foreground text-sm">
                      {stat.label}
                    </div>
                    <div className="text-sm font-medium break-words">
                      {stat.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MountainIcon className="text-muted-foreground h-4 w-4" />
                {tRoute("labels.seasons")}
              </div>
              <div className="flex flex-wrap gap-2">
                {route.seasons.map((season) => (
                  <Badge key={season} variant="secondary">
                    {tRoute(`seasons.${season}`)}
                  </Badge>
                ))}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
