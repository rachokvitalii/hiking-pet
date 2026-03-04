import { toast } from "sonner"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"

export const DeleteList = ({ id }: { id: number }) => {
  const deleteList = api.packingLists.delete.useMutation()
  const utils = api.useUtils()

  const onDelete = (id: number) => {
    deleteList.mutate({ id }, {
      onSuccess: () => {
        toast.success("List deleted successfully")
        void utils.packingLists.getAll.invalidate()
      },
      onError: () => {
        toast.error("Failed to delete list")
      }
    })
  }

  return (
    <Button onClick={() => onDelete(id)} size="sm" className="cursor-pointer" variant="destructive">
      Delete
    </Button>
  )
}