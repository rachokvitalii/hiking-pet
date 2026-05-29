"use client";

import { PencilIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { packingListSchema } from "../../schemas/packing-list-schema";

const editSchema = packingListSchema.pick({ title: true });

type EditableListTitleProps = {
  listId: number;
  initialTitle: string;
};

export const EditableListTitle = ({
  listId,
  initialTitle,
}: EditableListTitleProps) => {
  const tToasts = useTranslations("toasts");
  const [title, setTitle] = useState(initialTitle);
  const [draftTitle, setDraftTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const utils = api.useUtils();

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [isEditing]);

  const updateList = api.packingLists.update.useMutation({
    onSuccess: async (_data, variables) => {
      await Promise.all([
        utils.packingLists.getAll.invalidate(),
        utils.packingLists.getById.invalidate({ id: listId }),
      ]);
      setTitle(variables.title);
      setDraftTitle(variables.title);
      setTitleError(null);
      setIsEditing(false);
      toast.success(tToasts("updateListSuccess"));
    },
    onError: () => {
      setTitleError(tToasts("updateListFailed"));
      toast.error(tToasts("updateListFailed"));
    },
  });

  const startEditing = () => {
    setDraftTitle(title);
    setTitleError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraftTitle(title);
    setTitleError(null);
    setIsEditing(false);
  };

  const saveTitle = () => {
    const nextTitle = draftTitle.trim();
    const result = editSchema.safeParse({ title: nextTitle });

    if (!result.success) {
      setTitleError(result.error.issues[0]?.message ?? "Invalid list name");
      return;
    }

    if (nextTitle === title) {
      cancelEditing();
      return;
    }

    updateList.mutate({
      id: listId,
      title: nextTitle,
    });
  };

  return (
    <div className="flex justify-center">
      {isEditing ? (
        <div className="w-full max-w-md">
          <Input
            ref={titleInputRef}
            aria-label="List name"
            className="h-10 text-center text-xl font-semibold"
            disabled={updateList.isPending}
            value={draftTitle}
            onBlur={saveTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveTitle();
              }

              if (event.key === "Escape") {
                event.preventDefault();
                cancelEditing();
              }
            }}
          />
          {titleError && (
            <p className="text-destructive mt-2 text-center text-sm">
              {titleError}
            </p>
          )}
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-center text-2xl font-semibold">
            {title}
          </h1>
          <Button
            aria-label="Edit list name"
            className="cursor-pointer"
            disabled={updateList.isPending}
            size="icon-sm"
            type="button"
            variant="ghost"
            onClick={startEditing}
          >
            <PencilIcon />
          </Button>
        </div>
      )}
    </div>
  );
};
