"use client"

import { useState } from "react"
import { Loader2Icon, PlusIcon } from "lucide-react"
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
import { TRIP_TYPES } from "~/types/types"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { routes } from "~/shared/routes"
import { useRouter } from "next/navigation"

export const CreateList = () => {
  const [open, setOpen] = useState(false)
  const t = useTranslations("actions")
  const tToasts = useTranslations("toasts")
  const tListTypes = useTranslations("packing.listTypes")
  const tLists = useTranslations("packing.lists")
  const router = useRouter()
  const utils = api.useUtils()

  const form = useForm<PackingListSchema>({
    resolver: zodResolver(packingListSchema),
    defaultValues: {
      title: "",
      type: TRIP_TYPES[0],
    },
  })

  const createList = api.packingLists.create.useMutation({
    onSuccess: async (data) => {
      await utils.packingLists.getAll.invalidate()
      setOpen(false)
      form.reset()
      if (data?.id) {
        router.push(routes.packingList(data.id))
      }
    },
    onError: () => {
      toast.error(tToasts("createListFailed"))
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
          {t("createNewList")} <PlusIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("createNewList")}</DialogTitle>
          </DialogHeader>

          <form
            className="pt-5"
            id="create-list-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldSet disabled={createList.isPending} className="flex flex-col gap-4">
              <Controller control={form.control} name="title" render={({ field, fieldState }) => (
                <Field className="flex flex-col gap-2">
                  <FieldLabel>{tLists("listName")}</FieldLabel>
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
                    <FieldLabel>{tLists("typeOfJourney")}</FieldLabel>
                    <FieldContent>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex gap-6"
                      >
                        {Object.values(TRIP_TYPES).map((value) => (
                          <label key={value} className="flex items-center gap-2 cursor-pointer">
                            <RadioGroupItem value={value} />
                            <span>{tListTypes(value)}</span>
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
              {t("cancel")}
            </Button>
            <Button
              className="cursor-pointer"
              type="submit"
              form="create-list-form"
              disabled={createList.isPending}
            >
              {createList.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                t("create")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
