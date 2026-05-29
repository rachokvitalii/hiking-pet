import { notFound } from "next/navigation";
import { routes } from "~/data/route";
import type { Route } from "~/types/types";

export default async function RoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = routes.find((route: Route) => route.id === id);

  if (!route) {
    notFound();
  }
  return (
    <div>
      <h1>{route.title}</h1>
    </div>
  );
}