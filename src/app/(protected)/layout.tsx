import React from "react";
import { auth } from "~/server/auth";
import { Header } from "~/components/header";
import { routes } from "~/shared/routes";
import { redirect } from "next/navigation";
import { Container } from "~/components/container";

export default async function LoggedInLayout ({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect(routes.login)
  }

  return (
    <>
      <Header />
      <Container className="pt-10">
        {children}
      </Container>
    </>
  )
}