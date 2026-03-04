'use client'

import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Controller, useForm } from "react-hook-form"
import { type ChangePasswordInput, changePasswordSchema } from "./validation"
import { zodResolver } from "@hookform/resolvers/zod"
import { changePasswordAction } from "./actions"
import { Button } from "~/components/ui/button"
import { formErrorsSetter } from "~/lib/form-errors"
import { toast } from "sonner"

const ChangePassword = () => {
  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    }
  })

  const onSubmit = async (data: ChangePasswordInput) => {
    form.clearErrors('root')

    const res = await changePasswordAction(data)

    if (!res?.ok) {
      formErrorsSetter(res.issues, form.setError)
    } else {
      form.reset()
      toast.success("Password has been successfully changed")
    }
  }

  return (
    <form className="pt-5 w-[400px]" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet disabled={form.formState.isSubmitting} className="flex flex-col gap-4">
        <Controller control={form.control} name="currentPassword" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Current Password</FieldLabel>
            <FieldContent>
              <Input type="password" {...field} />
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="password" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>New Password</FieldLabel>
            <FieldContent>
              <Input type="password" {...field} />
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        <Controller control={form.control} name="passwordConfirm" render={({ field, fieldState }) => (
          <Field className="flex flex-col gap-2">
            <FieldLabel>Password Confirm</FieldLabel>
            <FieldContent>
              <Input type="password" {...field} />
            </FieldContent>
            {fieldState.invalid && <FieldError >{fieldState.error?.message}</FieldError>}
          </Field>
        )} />
        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root?.message}</FieldError>
        )}
        <Field orientation="horizontal">
          <Button type="submit" className="cursor-pointer">
            Update password
          </Button>
        </Field>
      </FieldSet>
    </form>
  )
}

export { ChangePassword }
