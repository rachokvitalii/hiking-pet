"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ConfirmationModal } from "~/components/confirmation-modal";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export const DeleteList = ({ id }: { id: number }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations("actions");
  const tToasts = useTranslations("toasts");

  const deleteList = api.packingLists.delete.useMutation();
  const utils = api.useUtils();

  const onDelete = () => {
    deleteList.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success(tToasts("deleteListSuccess"));
          void utils.packingLists.getAll.invalidate();
          setOpen(false);
        },
        onError: () => {
          toast.error(tToasts("deleteListFailed"));
        },
      },
    );
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        className="cursor-pointer"
        variant="destructive"
      >
        {t("delete")}
      </Button>

      <ConfirmationModal
        open={open}
        onOpenChange={setOpen}
        title="Delete list?"
        description="This action cannot be undone. The packing list will be permanently deleted."
        confirmLabel={t("delete")}
        pendingLabel="Deleting..."
        isPending={deleteList.isPending}
        onConfirm={onDelete}
      />
    </>
  );
};
