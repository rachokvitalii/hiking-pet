import { createHash } from "node:crypto";

export const ROUTE_EMBEDDING_DIMENSIONS = 1536;

export type RouteEmbeddingDocumentInput = {
  title: string;
  description: string;
  region: string;
  type: string[];
  difficulty: string;
  distanceKm: number;
  days: number;
  elevationGain: number;
  seasons: string[];
};

export function buildRouteEmbeddingDocument(
  route: RouteEmbeddingDocumentInput,
) {
  return [
    `Назва: ${route.title}`,
    `Опис: ${route.description}`,
    `Регіон: ${route.region}`,
    `Тип: ${route.type.join(", ")}`,
    `Складність: ${route.difficulty}`,
    `Дистанція: ${route.distanceKm} км`,
    `Тривалість: ${route.days} дн.`,
    `Набір висоти: ${route.elevationGain} м`,
    `Сезони: ${route.seasons.join(", ")}`,
  ].join("\n");
}

export function getRouteEmbeddingSourceHash(
  route: RouteEmbeddingDocumentInput,
) {
  return createHash("sha256")
    .update(buildRouteEmbeddingDocument(route))
    .digest("hex");
}
