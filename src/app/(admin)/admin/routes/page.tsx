import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RouteActions } from "~/features/routes-admin/components/route-actions";
import { getAdminRoutes } from "~/features/routes-admin/queries";
import { appRoutes } from "~/shared/app-routes";

const embeddingStatusLabel = {
  ready: "Embedding ready",
  stale: "Embedding stale",
  missing: "Embedding missing",
} as const;

const embeddingStatusVariant = {
  ready: "secondary",
  stale: "outline",
  missing: "destructive",
} as const;

export default async function AdminRoutesPage() {
  const routes = await getAdminRoutes();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold">Admin routes</h1>
          <p className="text-muted-foreground text-sm">
            Create, edit, delete, and refresh embeddings for hiking routes.
          </p>
        </div>
        <Button asChild>
          <Link href={appRoutes.adminNewRoute}>
            <PlusIcon data-icon="inline-start" />
            New route
          </Link>
        </Button>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No routes yet</CardTitle>
            <CardDescription>
              Create the first route to populate the hiking route catalog.
            </CardDescription>
            <CardAction>
              <Button asChild size="sm">
                <Link href={appRoutes.adminNewRoute}>Create route</Link>
              </Button>
            </CardAction>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {routes.map((route) => (
            <Card key={route.id}>
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <CardTitle>{route.title}</CardTitle>
                  <CardDescription>{route.slug}</CardDescription>
                </div>
                <CardAction>
                  <Badge
                    variant={embeddingStatusVariant[route.embeddingStatus]}
                  >
                    {embeddingStatusLabel[route.embeddingStatus]}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="text-muted-foreground text-sm">
                  Updated {route.updatedAt.toLocaleString()}
                </div>
                <RouteActions routeId={route.id} routeTitle={route.title} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
