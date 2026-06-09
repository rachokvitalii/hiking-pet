import { Loader2Icon, MountainSnowIcon } from "lucide-react";

import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";

type AssistantHeaderProps = {
  isPending: boolean;
};

export function AssistantHeader({ isPending }: AssistantHeaderProps) {
  return (
    <CardHeader className="border-b px-5 py-5 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg">
              <MountainSnowIcon className="size-5" />
            </div>
            <div className="grid gap-1">
              <CardTitle className="text-xl">Hiking Assistant</CardTitle>
              <CardDescription>
                Routes, packing lists, and trip recommendations.
              </CardDescription>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:flex",
            isPending
              ? "border-primary/30 bg-primary/10 text-primary"
              : "bg-muted/40 text-muted-foreground",
          )}
        >
          {isPending ? (
            <Loader2Icon className="size-3.5 animate-spin" />
          ) : (
            <span className="size-2 rounded-full bg-emerald-500" />
          )}
          {isPending ? "Thinking" : "Ready"}
        </div>
      </div>
    </CardHeader>
  );
}
