import { auth } from "~/server/auth";
import { routes } from "~/shared/routes";
import { redirect } from "next/navigation";

export default async function LoggedOutLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!!session?.user?.id) {
    redirect(routes.profile)
  }

  return children
}