"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { appRoutes } from "~/shared/app-routes";
import { api } from "~/trpc/react";

export const GetRecommendation = () => {
  const t = useTranslations("actions");
  const router = useRouter();

  const { mutate: getAiRecommendation, isPending } =
    api.aiRecommendations.createRecommendations.useMutation({
      onSuccess: ({ recommendationId }) => {
        router.push(appRoutes.recommendedRouteDetails(recommendationId));
      },
      onError: (error) => {
        console.error(error);
      },
    });

  return (
    <div className="mb-4 flex justify-center">
      <Button
        disabled={isPending}
        className="cursor-pointer"
        onClick={() => getAiRecommendation()}
      >
        {t("getAiRecommendation")}
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
      </Button>
    </div>
  );
};
