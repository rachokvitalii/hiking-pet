import { notFound } from "next/navigation";
import { EditListPage } from "~/features/packing-lists/components/edit-list/edit-list-page";
import { api } from "~/trpc/server";

type PackingListPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PackingListPage({
  params,
}: PackingListPageProps) {
  const { id } = await params;
  const listId = Number(id);

  if (!Number.isInteger(listId)) {
    notFound();
  }

  const list = await api.packingLists.getById({ id: listId });

  if (!list) {
    notFound();
  }

  return <EditListPage list={list} />;
}
