"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Spinner } from "~/components/ui/spinner";
import { appRoutes } from "~/shared/app-routes";
import {
  deleteRouteAction,
  reEmbedRouteAction,
} from "~/features/routes-admin/actions";

type RouteActionsProps = {
  routeId: number;
  routeTitle: string;
  showEdit?: boolean;
};

function getIssuesMessage(issues: Array<{ message: string }>) {
  return issues.map((issue) => issue.message).join("\n");
}

export function RouteActions({
  routeId,
  routeTitle,
  showEdit = true,
}: RouteActionsProps) {
  const router = useRouter();
  const [isReEmbedding, startReEmbedding] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const onReEmbed = () => {
    startReEmbedding(async () => {
      const result = await reEmbedRouteAction(routeId);

      if (!result.ok) {
        toast.error(getIssuesMessage(result.issues));
        return;
      }

      toast.success("Route embedding refreshed");
      router.refresh();
    });
  };

  const onDelete = () => {
    startDeleting(async () => {
      const result = await deleteRouteAction(routeId);

      if (!result.ok) {
        toast.error(getIssuesMessage(result.issues));
        return;
      }

      toast.success("Route deleted");
      setIsDeleteOpen(false);
      router.push(appRoutes.adminRoutes);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showEdit && (
        <Button asChild size="sm" variant="outline">
          <Link href={appRoutes.adminEditRoute(routeId)}>Edit</Link>
        </Button>
      )}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onReEmbed}
        disabled={isReEmbedding || isDeleting}
      >
        {isReEmbedding ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <RefreshCwIcon data-icon="inline-start" />
        )}
        Re-embed
      </Button>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            disabled={isReEmbedding || isDeleting}
          >
            <Trash2Icon data-icon="inline-start" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete route?</DialogTitle>
            <DialogDescription>
              This will permanently delete {routeTitle} and cascade related
              recommendation items. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Spinner data-icon="inline-start" />}
              Delete route
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
