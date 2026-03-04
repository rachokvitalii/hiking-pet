import z from "zod";
import { PackingListType } from "../types/types";

export const packingListSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(Object.values(PackingListType)),
})

export type PackingListSchema = z.infer<typeof packingListSchema>