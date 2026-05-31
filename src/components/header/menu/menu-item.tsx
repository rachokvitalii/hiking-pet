"use client";

import Link from "next/link";
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

type MenuItemLinkProps = {
  href: string;
  children: React.ReactNode;
};

export const MenuItem = ({ href, children }: MenuItemLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isActive) {
    return (
      <DropdownMenuItem className="cursor-default font-bold">
        {children}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link href={href} className="cursor-pointer">
        {children}
      </Link>
    </DropdownMenuItem>
  );
};
