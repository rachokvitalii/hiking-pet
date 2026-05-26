"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { z } from "zod"
import { useTranslations } from "next-intl"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { api } from "~/trpc/react"
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "~/components/ui/field"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { packingListSchema } from "../../schemas/packing-list-schema"
import type { PackingListType } from "../../types/types"

type EditListProps = {
  list: {
    id: number
    title: string
    type: string
  }
}

export const EditList = ({ list }: EditListProps) => {
  const [open, setOpen] = useState(false)
  const tListTypes = useTranslations("packing.listTypes")
  const tCategories = useTranslations("packing.categories")
  const tCatalogItems = useTranslations("packing.catalogItems")

  const utils = api.useUtils()
  const { data: categories = [], isLoading: isCategoriesLoading } = api.packingLists.getCategories.useQuery(undefined, {
    enabled: open,
  })
  const { data: catalogItems = [], isLoading: isCatalogItemsLoading } = api.packingLists.getCatalogItems.useQuery(undefined, {
    enabled: open,
  })

  console.log(catalogItems)
  const catalogItemsByCategoryId = useMemo(() => {
    const itemsByCategoryId = new Map<number, typeof catalogItems>()

    for (const item of catalogItems) {
      const items = itemsByCategoryId.get(item.categoryId) ?? []
      items.push(item)
      itemsByCategoryId.set(item.categoryId, items)
    }

    return itemsByCategoryId
  }, [catalogItems])

  const editSchema = packingListSchema.pick({ title: true })
  type EditSchema = z.infer<typeof editSchema>

  const form = useForm<EditSchema>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: list.title,
    },
  })

  const updateList = api.packingLists.update.useMutation({
    onSuccess: async () => {
      await utils.packingLists.getAll.invalidate()
      setOpen(false)
      toast.success("List updated successfully")
    },
    onError: () => {
      toast.error("Failed to update list")
    },
  })

  const onSubmit = (data: EditSchema) => {
    updateList.mutate({ ...data, type: list.type as PackingListType, id: list.id })
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset({ title: list.title })
    }
    setOpen(value)
  }

  return (
    <>
      <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setOpen(true)}>
        Edit
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit list</DialogTitle>
          </DialogHeader>

          <form
            className="pt-5"
            id="edit-list-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldSet disabled={updateList.isPending} className="flex flex-col gap-4">
              <Controller control={form.control} name="title" render={({ field, fieldState }) => (
                <Field className="flex flex-col gap-2">
                  <FieldLabel>List name</FieldLabel>
                  <FieldContent>
                    <Input type="text" {...field} value={field.value ?? ""} />
                  </FieldContent>
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )} />
              <Field className="flex flex-col gap-2">
                <FieldLabel>Type of journey</FieldLabel>
                <FieldContent>
                  <span className="text-sm text-muted-foreground">
                    {tListTypes(list.type as PackingListType)}
                  </span>
                </FieldContent>
              </Field>
              <Field className="flex flex-col gap-2">
                <FieldLabel>Categories</FieldLabel>
                <FieldContent>
                  {isCategoriesLoading ? (
                    <span className="text-sm text-muted-foreground">Loading...</span>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {categories.map((category) => (
                        <AccordionItem key={category.id} value={category.key}>
                          <AccordionTrigger>
                            {tCategories(category.key)}
                          </AccordionTrigger>
                          <AccordionContent>
                            {isCatalogItemsLoading ? (
                              <span className="text-sm text-muted-foreground">Loading...</span>
                            ) : (
                              <div className="grid gap-2">
                                {(catalogItemsByCategoryId.get(category.id) ?? []).map((item) => (
                                  <label
                                    key={item.id}
                                    className="flex min-h-8 cursor-pointer items-center gap-3 rounded-md px-1 text-sm"
                                  >
                                    <Checkbox />
                                    <span>{tCatalogItems(item.key)}</span>
                                  </label>
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
          </form>

          <DialogFooter className="gap-2">
            <Button
              className="cursor-pointer"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={updateList.isPending}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              form="edit-list-form"
              disabled={updateList.isPending}
            >
              {updateList.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
