import Link from "next/link"
import { TentTree } from "lucide-react"
import { routes } from "~/shared/routes"

export const Logo = () => {
  return (
    <Link href={routes.profile} className="flex items-center p-2">
      <TentTree width={40} height={40} />
    </Link>
  )
}