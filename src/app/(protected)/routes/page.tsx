import Link from "next/link";
import { RouteIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { routes } from "~/data/route";

export default function RoutesPage() {
  const t = useTranslations("actions");
  const tRoute = useTranslations("routes");

  return (
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
  );
}
