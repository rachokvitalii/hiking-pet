"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { FieldSet } from "~/components/ui/field";
import { routes } from "~/shared/routes";
import type { PackingListType } from "../../types/types";
import { CatalogItemsSection } from "./catalog-items-section";
import { EditableListTitle } from "./editable-list-title";

type EditListPageProps = {
  list: {
    id: number;
    title: string;
    type: string;
  };
};

export const EditListPage = ({ list }: EditListPageProps) => {
  const tListTypes = useTranslations("packing.listTypes");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 pb-10">
      <div className="mb-4">
        <Button asChild variant="ghost" className="cursor-pointer">
          <Link href={routes.profile}>
            <ArrowLeftIcon />
            Back to profile
          </Link>
        </Button>
      </div>

      <Card className="relative">
        <Badge
          className="absolute top-0 right-4 -translate-y-1/2"
          variant="default"
        >
          {tListTypes(list.type as PackingListType)}
        </Badge>

        <CardContent>
          <div className="space-y-5">
            <EditableListTitle listId={list.id} initialTitle={list.title} />

            <FieldSet className="flex flex-col gap-4">
              <CatalogItemsSection listId={list.id} />
            </FieldSet>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
