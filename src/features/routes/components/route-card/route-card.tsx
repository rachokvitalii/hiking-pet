import Link from "next/link";
import { RouteIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { routes as staticRoutes } from "~/shared/routes";
import type { Route } from "~/features/routes/types";
import { getTranslations } from "next-intl/server";

type RouteCard = Route & { recommendation?: { reason: string | null; } | null };

export const RouteCard = async ({ route }: { route: RouteCard }) => {
  const tActions = await getTranslations("actions");
  const tRoute = await getTranslations("routes");

  return (
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
              `${staticRoutes.routes}/${route.id}`
            }
          >
            {tActions("view")}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
};