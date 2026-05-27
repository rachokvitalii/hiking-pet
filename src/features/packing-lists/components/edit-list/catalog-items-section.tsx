"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { Field, FieldContent } from "~/components/ui/field";
import { api } from "~/trpc/react";
import { CatalogItemCheckbox } from "./catalog-item-checkbox";

type CatalogItemsSectionProps = {
  listId: number;
};

export const CatalogItemsSection = ({ listId }: CatalogItemsSectionProps) => {
  const tCategories = useTranslations("packing.categories");
  const tCatalogItems = useTranslations("packing.catalogItems");

  const { data: categories = [], isLoading: isCategoriesLoading } =
    api.gearCatalog.getCategories.useQuery();
  const { data: catalogItems = [], isLoading: isCatalogItemsLoading } =
    api.gearCatalog.getCatalogItems.useQuery();
  const { data: listItems = [], isLoading: isListItemsLoading } =
    api.gearCatalog.getCheckedItems.useQuery({ listId });

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
    <Field className="flex flex-col gap-2">
      <FieldContent>
        {isCategoriesLoading ? (
          <span className="text-muted-foreground text-sm">Loading...</span>
        ) : (
          <Accordion type="multiple" className="w-full">
            {categories.map((category) => (
              <AccordionItem key={category.id} value={category.key}>
                <AccordionTrigger>{tCategories(category.key)}</AccordionTrigger>
                <AccordionContent>
                  {isCatalogItemsLoading ? (
                    <span className="text-muted-foreground text-sm">
                      Loading...
                    </span>
                  ) : (
                    <div className="grid gap-2">
                      {(catalogItemsByCategoryId.get(category.id) ?? []).map(
                        (item) => (
                          <CatalogItemCheckbox
                            key={item.id}
                            checked={selectedCatalogItemIds.has(item.id)}
                            disabled={isListItemsLoading}
                            item={item}
                            label={tCatalogItems(item.key)}
                            listId={listId}
                          />
                        ),
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </FieldContent>
    </Field>
  );
};
