import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { SignOut } from "~/components/sign-out";
import { routes } from "~/shared/routes";
import { MenuItem } from "./menu-item";

export const Menu = () => {
  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer rounded-sm border-2 p-1">
            <User />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <MenuItem href={routes.profile}>Profile</MenuItem>
          <MenuItem href={routes.settings}>Settings</MenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
