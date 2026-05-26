"use client";

import { api } from "~/trpc/react";
import { CreateList } from "../create-list";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { PackingListItems } from "./packing-list-items";

export const PackingList = () => {
  const {
    data: packingLists,
    isLoading,
    error,
  } = api.packingLists.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-destructive pt-6 text-sm">
          {error.message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <CreateList />
      <PackingListItems items={packingLists ?? []} />
    </div>
  );
};
