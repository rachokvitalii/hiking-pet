import React, { type FC } from "react";
import { cn } from "~/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement>

export const Container: FC<Props> = ({ className, children }) => {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-6", className)}>{children}</div>
  )
}
