"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
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

export const CreateList = () => {
  const [open, setOpen] = useState(false)

  const utils = api.useUtils()

  const form = useForm<PackingListSchema>({
    resolver: zodResolver(packingListSchema),
    defaultValues: {
      title: "",
      type: PackingListType.Hiking,
    },
  })

  const createList = api.packingLists.create.useMutation({
    onSuccess: async () => {
      await utils.packingLists.getAll.invalidate()
      setOpen(false)
      form.reset()
    },
  })

  const onSubmit = (data: PackingListSchema) => {
    createList.mutate(data)
  }

  return (
    <>
      <div className="mb-4 flex justify-center">
        <Button
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          Add new list <PlusIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create new list</DialogTitle>
          </DialogHeader>

          <form
            className="pt-5"
            id="create-list-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldSet disabled={form.formState.isSubmitting} className="flex flex-col gap-4">
              <Controller control={form.control} name="title" render={({ field, fieldState }) => (
                <Field className="flex flex-col gap-2">
                  <FieldLabel>List name</FieldLabel>
                  <FieldContent>
                    <Input type="text" {...field} value={field.value ?? ""} />
                  </FieldContent>
                  {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
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
              onClick={() => setOpen(false)}
              disabled={createList.isPending}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              form="create-list-form"
              disabled={form.formState.isSubmitting}
            >
              {createList.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}