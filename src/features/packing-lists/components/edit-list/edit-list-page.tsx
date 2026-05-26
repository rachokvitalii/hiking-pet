"use client";

import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldSet,
} from "~/components/ui/field";
import { routes } from "~/shared/routes";
import { api } from "~/trpc/react";
import type { PackingListType } from "../../types/types";
import { EditableListTitle } from "./editable-list-title";
import { PackingCatalogItemCheckbox } from "./packing-catalog-item-checkbox";

type EditListPageProps = {
  list: {
    id: number;
    title: string;
    type: string;
  };
};

export const EditListPage = ({ list }: EditListPageProps) => {
  const tListTypes = useTranslations("packing.listTypes");
  const tCategories = useTranslations("packing.categories");
  const tCatalogItems = useTranslations("packing.catalogItems");

  const { data: categories = [], isLoading: isCategoriesLoading } =
    api.gearCatalog.getCategories.useQuery();
  const { data: catalogItems = [], isLoading: isCatalogItemsLoading } =
    api.gearCatalog.getCatalogItems.useQuery();
  const { data: listItems = [], isLoading: isListItemsLoading } =
    api.packingLists.getItems.useQuery({ listId: list.id });

  const catalogItemsByCategoryId = useMemo(() => {
    const itemsByCategoryId = new Map<number, typeof catalogItems>();

    for (const item of catalogItems) {
      const items = itemsByCategoryId.get(item.categoryId) ?? [];
      items.push(item);
      itemsByCategoryId.set(item.categoryId, items);
    }

    return itemsByCategoryId;
  }, [catalogItems]);

  const selectedCatalogItemIds = useMemo(() => {
    const ids = new Set<number>();

    for (const item of listItems) {
      if (item.catalogItemId) {
        ids.add(item.catalogItemId);
      }
    }

    return ids;
  }, [listItems]);

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

      <Card>
        <CardContent>
          <div className="space-y-5">
            <EditableListTitle listId={list.id} initialTitle={list.title} />

            <FieldSet className="flex flex-col gap-4">
              <Field className="flex flex-col gap-2">
                <FieldLabel>Type of journey</FieldLabel>
                <FieldContent>
                  <span className="text-muted-foreground text-sm">
                    {tListTypes(list.type as PackingListType)}
                  </span>
                </FieldContent>
              </Field>

              <Field className="flex flex-col gap-2">
                <FieldLabel>Categories</FieldLabel>
                <FieldContent>
                  {isCategoriesLoading ? (
                    <span className="text-muted-foreground text-sm">
                      Loading...
                    </span>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {categories.map((category) => (
                        <AccordionItem key={category.id} value={category.key}>
                          <AccordionTrigger>
                            {tCategories(category.key)}
                          </AccordionTrigger>
                          <AccordionContent>
                            {isCatalogItemsLoading ? (
                              <span className="text-muted-foreground text-sm">
                                Loading...
                              </span>
                            ) : (
                              <div className="grid gap-2">
                                {(
                                  catalogItemsByCategoryId.get(category.id) ??
                                  []
                                ).map((item) => (
                                  <PackingCatalogItemCheckbox
                                    key={item.id}
                                    checked={selectedCatalogItemIds.has(
                                      item.id,
                                    )}
                                    disabled={isListItemsLoading}
                                    item={item}
                                    label={tCatalogItems(item.key)}
                                    listId={list.id}
                                  />
                                ))}
                              </div>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </FieldContent>
              </Field>
            </FieldSet>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};
