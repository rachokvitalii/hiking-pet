"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { routes } from "~/shared/routes";
import { api } from "~/trpc/react";

export const GetRecommendation = () => {
  const t = useTranslations("actions");
  const router = useRouter();

  const { mutate: getAiRecommendation, isPending } =
    api.ai.createRecommendations.useMutation({
      onSuccess: ({ recommendationId }) => {
        router.push(`${routes.recommendedRoutes}/${recommendationId}`);
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
