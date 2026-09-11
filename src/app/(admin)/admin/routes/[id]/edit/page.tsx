import Link from "next/link";
import { notFound } from "next/navigation";

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
import { RouteForm } from "~/features/routes-admin/components/route-form";
import { getAdminRoute } from "~/features/routes-admin/queries";
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

export default async function EditAdminRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const route = await getAdminRoute(Number(id));

  if (!route) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="outline" className="w-fit">
        <Link href={appRoutes.adminRoutes}>Back to routes</Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <CardTitle>Edit route</CardTitle>
            <CardDescription>{route.title}</CardDescription>
          </div>
          <CardAction>
            <Badge variant={embeddingStatusVariant[route.embeddingStatus]}>
              {embeddingStatusLabel[route.embeddingStatus]}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <RouteActions
            routeId={route.id}
            routeTitle={route.title}
            showEdit={false}
          />
          <RouteForm
            mode="edit"
            routeId={route.id}
            initialValues={{
              slug: route.slug,
              title: route.title,
              description: route.description,
              region: route.region,
              type: route.type,
              difficulty: route.difficulty,
              latitude: route.latitude,
              longitude: route.longitude,
              distanceKm: route.distanceKm,
              days: route.days,
              elevationGain: route.elevationGain,
              seasons: route.seasons,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
