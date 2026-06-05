import Link from "next/link";
import { CalendarDaysIcon, ClockIcon } from "lucide-react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { appRoutes } from "~/shared/app-routes";
import { api } from "~/trpc/server";

const dateFormatter = new Intl.DateTimeFormat("uk-UA", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const statusLabel = {
  pending: "В обробці",
  completed: "Готово",
  failed: "Помилка",
} as const;

export default async function RecommendedRoutesPage() {
  const recommendations =
    await api.aiRecommendations.getRecommendedCollections();

  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            Рекомендовані маршрути
          </h1>
          <p className="text-muted-foreground">
            Збережених добірок маршрутів поки немає.
          </p>
        </div>

        <Card>
          <CardHeader className="gap-2 text-center">
            <CardTitle className="text-xl">Створіть першу добірку</CardTitle>
            <CardDescription>
              Перейдіть до маршрутів і згенеруйте рекомендації на основі вашого
              профілю.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href={appRoutes.routes}>До маршрутів</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Рекомендовані маршрути
          </h1>
          <p className="text-muted-foreground">
            {recommendations.length}{" "}
            {getRecommendationCountLabel(recommendations.length)}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {recommendations.map((recommendation) => {
          const recommendationTitle = getRecommendationTitle({
            title: recommendation.title,
            createdAt: recommendation.createdAt,
          });

          return (
            <Card key={recommendation.id}>
              <CardHeader className="gap-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <CardTitle className="text-xl break-words">
                      {recommendationTitle}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <CalendarDaysIcon className="h-4 w-4 shrink-0" />
                      {dateFormatter.format(recommendation.createdAt)}
                    </CardDescription>
                  </div>

                  <Badge variant={getStatusBadgeVariant(recommendation.status)}>
                    {statusLabel[recommendation.status]}
                  </Badge>
                </div>
              </CardHeader>

              <CardFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <ClockIcon className="h-4 w-4 shrink-0" />
                  {recommendation.completedAt
                    ? `Завершено ${dateFormatter.format(recommendation.completedAt)}`
                    : "Очікується завершення"}
                </div>
                <Button asChild variant="outline">
                  <Link
                    href={appRoutes.recommendedRouteDetails(recommendation.id)}
                  >
                    Відкрити
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function getRecommendationTitle({
  title,
  createdAt,
}: {
  title: string | null;
  createdAt: Date;
}) {
  return title?.trim() ?? `Добірка від ${dateFormatter.format(createdAt)}`;
}

function getRecommendationCountLabel(count: number) {
  return count === 1 ? "добірка" : "добірки";
}

function getStatusBadgeVariant(status: keyof typeof statusLabel) {
  if (status === "completed") return "secondary";
  if (status === "failed") return "destructive";

  return "outline";
}
