import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { SignOut } from "~/components/sign-out";
import { appRoutes } from "~/shared/app-routes";
import { MenuItem } from "./menu-item";

export const Menu = () => {
  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open settings menu"
            className="cursor-pointer rounded-sm border-2 p-1"
          >
            <Settings />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <MenuItem href={appRoutes.settings}>Settings</MenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <SignOut />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
