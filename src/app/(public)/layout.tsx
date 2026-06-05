import { auth } from "~/server/auth";
import { appRoutes } from "~/shared/app-routes";
import { redirect } from "next/navigation";

export default async function LoggedOutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!!session?.user?.id) {
    redirect(appRoutes.profile);
  }

  return children;
}
