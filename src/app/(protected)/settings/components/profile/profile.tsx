'use client'

import { type FC, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { profileSchema, type ProfileSchema } from "./validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { HIKE_TYPE_LABEL } from "~/types/types";

const Profile: FC = () => {
  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: null,
      homeRegion: null,
      experienceLevel: null,
      preferredHikeType: null,
      maxDailyKm: null,
      gear: null,
    }
  })

  const me = api.profile.me.useQuery()

  useEffect(() => {
    if (me.data) {
      const parsedExp = profileSchema.shape.experienceLevel.safeParse(me.data.experienceLevel)
      const parsedHike = profileSchema.shape.preferredHikeType.safeParse(me.data.preferredHikeType)

      form.reset({
        displayName: me.data.displayName ?? null,
        homeRegion: me.data.homeRegion ?? null,
        experienceLevel: parsedExp.success ? parsedExp.data : null,
        preferredHikeType: parsedHike.success ? parsedHike.data : null,
        maxDailyKm: me.data.maxDailyKm ?? null,
      })
    }
  }, [me.data, form])

  const utils = api.useUtils()

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: async () => {
      void utils.profile.me.invalidate()
      toast.success("Profile data saved")
    }
  })

  const onSubmit = async (data: ProfileSchema) => {
    await updateProfile.mutateAsync(data)
  }

  return (
    <form className="pt-5 w-[400px]" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet disabled={form.formState.isSubmitting} className="flex flex-col gap-4">
        <Controller control={form.control} name="displayName" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Name</FieldLabel>
            <FieldContent>
              <Input type="text" {...field} value={field.value ?? ""} />
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="homeRegion" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Home Region</FieldLabel>
            <FieldContent>
              <Input type="text" {...field} value={field.value ?? ""} />
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="experienceLevel" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Experience Level</FieldLabel>
            <FieldContent>
              <select
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={fieldState.invalid}
              >
                <option value="">Select experience level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="preferredHikeType" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Preferred Hike Type</FieldLabel>
            <FieldContent>
              <select
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
                aria-invalid={fieldState.invalid}
              >
                <option value="">Select hike type</option>

                {Object.entries(HIKE_TYPE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="maxDailyKm" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Max Daily Km</FieldLabel>
            <FieldContent>
              <Input
                type="number"
                value={field.value ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    field.onChange(null);
                  } else {
                    const numValue = Number(value);
                    if (!isNaN(numValue)) {
                      field.onChange(numValue);
                    }
                  }
                }}
                onBlur={field.onBlur}
                min={1}
                max={100}
                aria-invalid={fieldState.invalid}
              />
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        {/* TODO: Add gear selection */}
        {/*  */}
        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root?.message}</FieldError>
        )}
        <Field orientation="horizontal">
          <Button type="submit" className="cursor-pointer">
            Save data
          </Button>
        </Field>
      </FieldSet>
    </form>
  )
}

export { Profile }