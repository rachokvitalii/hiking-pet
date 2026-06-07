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
];

export const HeaderNavigation = () => {
  const pathname = usePathname();

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {navigationItems.map(({ href, label }) => {
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
