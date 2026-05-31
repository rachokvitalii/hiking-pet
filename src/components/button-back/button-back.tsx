import { ArrowLeftIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { useTranslations } from "next-intl"

export const ButtonBack = ({ href, text }: { href: string, text?: string }) => {
  const tActions = useTranslations("actions")

  return (
    <div className="mb-4">
      <Button asChild variant="outline" className="cursor-pointer">
        <Link href={href}>
          <ArrowLeftIcon />
          {text ?? tActions("back")}
        </Link>
      </Button>
    </div>
  )
}