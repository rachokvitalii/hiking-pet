"use client";

import { toast } from "sonner";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";

type PackingCatalogItemCheckboxProps = {
  listId: number;
  item: {
    id: number;
  };
  label: string;
  checked: boolean;
  disabled?: boolean;
};

export const PackingCatalogItemCheckbox = ({
  listId,
  item,
  label,
  checked,
  disabled = false,
}: PackingCatalogItemCheckboxProps) => {
  const utils = api.useUtils();

  const setCatalogItemIncluded =
    api.packingLists.setCatalogItemIncluded.useMutation({
      onMutate: async (variables) => {
        await utils.packingLists.getItems.cancel({ listId: variables.listId });

        const previousItems = utils.packingLists.getItems.getData({
          listId: variables.listId,
        });

        utils.packingLists.getItems.setData(
          { listId: variables.listId },
          (currentItems) => {
            const items = currentItems ?? [];

            if (variables.included) {
              if (
                items.some(
                  (item) => item.catalogItemId === variables.catalogItemId,
                )
              ) {
                return items;
              }

              return [
                ...items,
                {
                  id: -variables.catalogItemId,
                  catalogItemId: variables.catalogItemId,
                },
              ];
            }

            return items.filter(
              (item) => item.catalogItemId !== variables.catalogItemId,
            );
          },
        );

        return { previousItems };
      },
      onError: (_error, variables, context) => {
        utils.packingLists.getItems.setData(
          { listId: variables.listId },
          context?.previousItems,
        );
        toast.error("Failed to update item");
      },
      onSettled: async (_data, _error, variables) => {
        await utils.packingLists.getItems.invalidate({
          listId: variables.listId,
        });
      },
    });

  return (
    <label className="flex min-h-8 cursor-pointer items-center gap-3 rounded-md px-1 text-sm">
      <Checkbox
        checked={checked}
        disabled={disabled || setCatalogItemIncluded.isPending}
        onCheckedChange={(checked) =>
          setCatalogItemIncluded.mutate({
            listId,
            catalogItemId: item.id,
            included: checked === true,
          })
        }
      />
      <span className="select-none">{label}</span>
    </label>
  );
};
