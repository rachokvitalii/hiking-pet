'use client'

import { FormWrapper } from "~/components/form-wrapper/form-wrapper"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { type LoginFormInput, loginFormSchema } from "./validation"
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import { loginAction } from "./actions"
import { formErrorsSetter } from "~/lib/form-errors"
import { useRouter } from "next/navigation"
import { routes } from "~/shared/routes"
import Link from "next/link"

const LoginPage = () => {
  const router = useRouter()

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  })

  const onSubmit = async (data: LoginFormInput) => {
    form.clearErrors('root')

    const res = await loginAction(data)

    if (!res?.ok) {
      formErrorsSetter(res.issues, form.setError)
    } else {
      router.replace(routes.profile)
    }
  }

  return (
    <FormWrapper title="Login">
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FieldSet disabled={form.formState.isSubmitting} className="flex flex-col gap-4">
          <Controller control={form.control} name="email" render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <Input {...field} />
              </FieldContent>
              {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
            </Field>
          )} />
          <Controller control={form.control} name="password" render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <FieldLabel>Password</FieldLabel>
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
              Login
            </Button>
          </Field>
        </FieldSet>
      </form>
      <div className="mt-5 text-center text-xs">
        Don&apos;t have an account?{` `}
        <Link className="underline" href={routes.register}>Register</Link>
      </div>
    </FormWrapper>
  )
}

export default LoginPage