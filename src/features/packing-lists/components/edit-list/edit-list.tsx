"use client"

import { useState } from "react"
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
import { type PackingListSchema, packingListSchema } from "../../schemas/packing-list-schema"
import { PackingListType } from "../../types/types"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { toast } from "sonner"

type EditListProps = {
  list: {
    id: number
    title: string
    type: string
  }
}

export const EditList = ({ list }: EditListProps) => {
  const [open, setOpen] = useState(false)

  const utils = api.useUtils()

  const form = useForm<PackingListSchema>({
    resolver: zodResolver(packingListSchema),
    defaultValues: {
      title: list.title,
      type: list.type as PackingListType,
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

  const onSubmit = (data: PackingListSchema) => {
    updateList.mutate({ ...data, id: list.id })
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      form.reset({ title: list.title, type: list.type as PackingListType })
    }
    setOpen(value)
  }

  return (
    <>
      <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => setOpen(true)}>
        Open
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

              <Controller
                control={form.control}
                name="type"
                render={({ field, fieldState }) => (
                  <Field className="flex flex-col gap-2">
                    <FieldLabel>Type of journey</FieldLabel>
                    <FieldContent>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        {Object.values(PackingListType).map((value) => (
                          <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value={value} />
                            <span className="capitalize">{value}</span>
                          </label>
                        ))}
                      </RadioGroup>
                    </FieldContent>
                    {fieldState.invalid && (
                      <FieldError>{fieldState.error?.message}</FieldError>
                    )}
                  </Field>
                )}
              />
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
