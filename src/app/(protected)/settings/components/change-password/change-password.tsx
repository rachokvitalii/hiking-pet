"use client";

import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldSet,
} from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "../../../../../features/profile/schemas/change-password-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { useTranslations } from "next-intl";

const ChangePassword = () => {
  const tToasts = useTranslations("toasts");

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const changePassword = api.profile.changePassword.useMutation({
    onSuccess: () => {
      form.reset();
      toast.success(tToasts("passwordChanged"));
    },
    onError: (error) => {
      if (error.data?.code === "BAD_REQUEST") {
        form.setError("currentPassword", { message: error.message });
      } else {
        form.setError("root", { message: error.message });
      }
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    await changePassword.mutateAsync(data);
  };

  return (
    <form className="w-[400px] pt-5" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet
        disabled={form.formState.isSubmitting}
        className="flex flex-col gap-4"
      >
        <Controller
          control={form.control}
          name="currentPassword"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <FieldLabel>Current Password</FieldLabel>
              <FieldContent>
                <Input type="password" {...field} />
              </FieldContent>
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <FieldLabel>New Password</FieldLabel>
              <FieldContent>
                <Input type="password" {...field} />
              </FieldContent>
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="passwordConfirm"
          render={({ field, fieldState }) => (
            <Field className="flex flex-col gap-2">
              <FieldLabel>Password Confirm</FieldLabel>
              <FieldContent>
                <Input type="password" {...field} />
              </FieldContent>
              {fieldState.invalid && (
                <FieldError>{fieldState.error?.message}</FieldError>
              )}
            </Field>
          )}
        />
        {form.formState.errors.root?.message && (
          <FieldError>{form.formState.errors.root.message}</FieldError>
        )}
        <Field orientation="horizontal">
          <Button type="submit" className="cursor-pointer">
            Update password
          </Button>
        </Field>
      </FieldSet>
    </form>
  );
};

export { ChangePassword };
