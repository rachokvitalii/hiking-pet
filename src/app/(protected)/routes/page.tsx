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

export default async function RoutesPage() {
  const t = await getTranslations("actions");
  const tRoute = await getTranslations("routes");
  const routes = await api.routes.getAll();

  return (
    <>
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
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>
                <Link href={`/routes/${route.id}`}>{t("view")}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
