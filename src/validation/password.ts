import z from "zod";

export const passwordSchema = z.string().min(4, {
  message: "Password must be at least 4 characters long",
}).max(32, {
  message: "Password must be at most 32 characters long",
});