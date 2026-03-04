import { z } from "zod";
import { emailSchema } from "~/validation/email";
import { passwordConfirmSchema } from "~/validation/passwordConfirm";

export const formSchema = z.object({
  email: emailSchema,
}).and(passwordConfirmSchema);

export type RegisterFormInput = z.infer<typeof formSchema>;