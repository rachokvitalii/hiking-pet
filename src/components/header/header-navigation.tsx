"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";
import { appRoutes } from "~/shared/app-routes";

const navigationItems = [
  {
    href: appRoutes.profile,
    label: "Profile",
  },
  {
    href: appRoutes.routes,
    label: "Routes",
  },
  {
    href: appRoutes.recommendedRoutes,
    label: "Recommended Routes",
  },
  {
    href: appRoutes.assistant,
    label: "Assistant",
  },
] as const;

type HeaderNavigationProps = {
  isAdmin?: boolean;
};

export const HeaderNavigation = ({
  isAdmin = false,
}: HeaderNavigationProps) => {
  const pathname = usePathname();
  const items = isAdmin
    ? [
        ...navigationItems,
        {
          href: appRoutes.adminRoutes,
          label: "Admin",
        },
      ]
    : navigationItems;

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {items.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <NavigationMenuItem key={href}>
              <NavigationMenuLink active={isActive} asChild>
                <Link href={href} aria-current={isActive ? "page" : undefined}>
                  {label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
