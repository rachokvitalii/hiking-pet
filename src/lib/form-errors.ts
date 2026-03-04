import { type Issues } from "~/types/types";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export const formErrorsSetter = <TFieldValues extends FieldValues>(
  issues: Issues,
  setError: UseFormSetError<TFieldValues>
) => {
  for (const issue of issues) {
    if (issue.path.length === 0) {
      setError('root', { message: issue.message })
      continue
    }

    const name = issue.path.join(".") as Path<TFieldValues>;

    setError(name, { message: issue.message });
  }
}
