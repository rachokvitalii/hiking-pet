"use client";

import { FormWrapper } from "~/components/form-wrapper/form-wrapper";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, FieldContent, FieldError, FieldLabel, FieldSet } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { registerAction } from "./actions";
import { type RegisterFormInput, formSchema } from "./validation";
import { formErrorsSetter } from "~/lib/form-errors";
import Link from "next/link";
import { routes } from "~/shared/routes";
import { toast } from "sonner"

const RegisterPage = () => {
  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit =  async (data: RegisterFormInput) => {
    form.clearErrors('root')

    const res = await registerAction(data)

    if (!res?.ok) {
      formErrorsSetter(res.issues, form.setError)
    } else {
      form.reset()
      toast.success("Account has been successfully created", { position: 'top-center' })
    }
  }

  return (
    <FormWrapper title="Register">
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
          <Controller control={form.control} name="passwordConfirm" render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <FieldLabel>Password Confirm</FieldLabel>
              <FieldContent>
                <Input type="password" {...field} />
              </FieldContent>
              {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
            </Field>
          )} />
          {form.formState.errors.root?.message && (
            <FieldError>{form.formState.errors.root?.message}</FieldError>
          )}
          <Field orientation="horizontal">
            <Button type="submit" className="cursor-pointer">
              Register
            </Button>
          </Field>
        </FieldSet>
      </form>
      <div className="mt-5 text-center text-xs">
        Already have an account?{` `}
        <Link className="underline" href={routes.login}>Login</Link>
      </div>
    </FormWrapper>
  )
};

export default RegisterPage;