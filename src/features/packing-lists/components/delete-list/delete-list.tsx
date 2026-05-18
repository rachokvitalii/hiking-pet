"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationModal } from "~/components/confirmation-modal";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export const DeleteList = ({ id }: { id: number }) => {
  const [open, setOpen] = useState(false);

  const deleteList = api.packingLists.delete.useMutation();
  const utils = api.useUtils();

  const onDelete = () => {
    deleteList.mutate(
      { id },
      {
        onSuccess: () => {
          toast.success("List deleted successfully");
          void utils.packingLists.getAll.invalidate();
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to delete list");
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
        Delete
      </Button>

      <ConfirmationModal
        open={open}
        onOpenChange={setOpen}
        title="Delete list?"
        description="This action cannot be undone. The packing list will be permanently deleted."
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        isPending={deleteList.isPending}
        onConfirm={onDelete}
      />
    </>
  );
};
