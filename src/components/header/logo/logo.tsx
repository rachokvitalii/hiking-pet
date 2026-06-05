import Link from "next/link";
import { TentTree } from "lucide-react";
import { appRoutes } from "~/shared/app-routes";

export const Logo = () => {
  return (
    <Link href={appRoutes.profile} className="flex items-center p-2">
      <TentTree width={40} height={40} />
    </Link>
  );
};
