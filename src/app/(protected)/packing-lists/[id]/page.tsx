import { notFound } from "next/navigation";
import { EditListPage } from "~/features/packing-lists/components/edit-list";
import { api, HydrateClient } from "~/trpc/server";

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

  void api.gearCatalog.getCatalog.prefetch();
  void api.gearCatalog.getCheckedItems.prefetch({ listId });

  return (
    <HydrateClient>
      <EditListPage list={list} />
    </HydrateClient>
  );
}
