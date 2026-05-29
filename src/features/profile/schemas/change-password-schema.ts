import { passwordSchema } from "~/validation/password";
import { passwordConfirmSchema } from "~/validation/passwordConfirm";
import z from "zod";

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
}).and(passwordConfirmSchema)

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>