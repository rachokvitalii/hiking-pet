import z from "zod";
import { passwordSchema } from "./password";

export const passwordConfirmSchema = z.object({
  password: passwordSchema,
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Passwords do not match",
  path: ['passwordConfirm'],
});