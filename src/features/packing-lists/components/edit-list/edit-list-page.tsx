"use client";

import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { FieldSet } from "~/components/ui/field";
import { routes } from "~/shared/routes";
import { type TripType } from "~/types/types";
import { CatalogItemsSection } from "./catalog-items-section";
import { EditableListTitle } from "./editable-list-title";
import { ButtonBack } from "~/components/button-back";

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
    <>
      <ButtonBack href={routes.profile} />

      <Card className="relative">
        <Badge
          className="absolute top-0 right-4 -translate-y-1/2"
          variant="default"
        >
          {tListTypes(list.type as TripType)}
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
    </>
  );
};
