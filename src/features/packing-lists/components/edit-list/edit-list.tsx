"use client"

import { useState } from "react"
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

  const utils = api.useUtils()
  const { data: categories = [], isLoading: isCategoriesLoading } = api.packingLists.getCategories.useQuery(undefined, {
    enabled: open,
  })

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
        <DialogContent className="sm:max-w-[425px]">
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
                            <span className="text-sm text-muted-foreground">
                              Gear catalog items will appear here.
                            </span>
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
