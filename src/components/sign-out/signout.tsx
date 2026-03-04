"use client"

import { LogOut } from "lucide-react"
import { DropdownMenuItem } from "~/components/ui/dropdown-menu"
import { SignOutAction } from "./actions"

export const SignOut = () => {
  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault()
        void SignOutAction()
      }}
      className="text-destructive focus:text-destructive cursor-pointer"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Sign out
    </DropdownMenuItem>
  )
}