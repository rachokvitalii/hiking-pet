'use client'

import { useForm, Controller } from "react-hook-form";
import { profileSchema, type ProfileSchema } from "./validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { EXPERIENCE_LEVEL_LABEL, EXPERIENCE_LEVELS, TRIP_DURATIONS_LABEL, TRIP_DURATIONS } from "~/types/types";

const selectClassName = "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

const defaultValues: ProfileSchema = {
  displayName: null,
  homeRegion: null,
  experienceLevel: null,
  preferredTripDuration: null,
  maxDailyKm: null
}

const Profile = () => {
  const me = api.profile.me.useQuery()

  const form = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    defaultValues,
    values: me.data ? {
      displayName: me.data.displayName ?? null,
      homeRegion: me.data.homeRegion ?? null,
      experienceLevel: (me.data.experienceLevel as ProfileSchema["experienceLevel"]) ?? null,
      preferredTripDuration: (me.data.preferredTripDuration as ProfileSchema["preferredTripDuration"]) ?? null,
      maxDailyKm: me.data.maxDailyKm ?? null,
    } : undefined,
  })

  const utils = api.useUtils()

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.profile.me.invalidate()
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
            {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="homeRegion" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Home Region</FieldLabel>
            <FieldContent>
              <Input type="text" {...field} value={field.value ?? ""} />
            </FieldContent>
            {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
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
                className={selectClassName}
                aria-invalid={fieldState.invalid}
              >
                <option value="">Select experience level</option>
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>{EXPERIENCE_LEVEL_LABEL[level]}</option>
                ))}
              </select>
            </FieldContent>
            {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="preferredTripDuration" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Preferred Trip Duration</FieldLabel>
            <FieldContent>
              <select
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value === "" ? null : e.target.value)}
                className={selectClassName}
                aria-invalid={fieldState.invalid}
              >
                <option value="">Select trip duration</option>
                {TRIP_DURATIONS.map((value) => (
                  <option key={value} value={value}>{TRIP_DURATIONS_LABEL[value]}</option>
                ))}
              </select>
            </FieldContent>
            {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
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
            {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root.message}</FieldError>
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
