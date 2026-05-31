type RecommendationSearchParams = Promise<{ recommendation?: string }>;

export async function getRecommendationId(
  searchParams: RecommendationSearchParams,
) {
  const { recommendation } = await searchParams;

  if (!recommendation) {
    return null;
  }

  const recommendationId = Number(recommendation);

  return Number.isInteger(recommendationId) && recommendationId > 0
    ? recommendationId
    : null;
}
