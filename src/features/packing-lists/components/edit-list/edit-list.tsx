import Link from "next/link";
import { Button } from "~/components/ui/button";
import { routes } from "~/shared/routes";

type EditListProps = {
  list: {
    id: number;
  };
};

export const EditList = ({ list }: EditListProps) => {
  return (
    <Button asChild size="sm" variant="outline" className="cursor-pointer">
      <Link href={routes.packingList(list.id)}>Edit</Link>
    </Button>
  );
};
