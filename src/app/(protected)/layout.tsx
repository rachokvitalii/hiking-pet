import React from "react";
import { auth } from "~/server/auth";
import { Header } from "~/components/header";
import { appRoutes } from "~/shared/app-routes";
import { redirect } from "next/navigation";
import { Container } from "~/components/container";

export default async function LoggedInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(appRoutes.login);
  }

  return (
    <>
      <Header />
      <Container className="pt-10">
        <main className="mx-auto w-full max-w-5xl px-6 pb-10">{children}</main>
      </Container>
    </>
  );
}
