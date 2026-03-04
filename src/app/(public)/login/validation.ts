import { emailSchema } from "~/validation/email";
import { passwordSchema } from "~/validation/password";
import z from "zod";

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export type LoginFormInput = z.infer<typeof loginFormSchema>
