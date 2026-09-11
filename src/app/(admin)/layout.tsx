import React from "react";
import { redirect } from "next/navigation";

import { Container } from "~/components/container";
import { Header } from "~/components/header";
import { appRoutes } from "~/shared/app-routes";
import { auth } from "~/server/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(appRoutes.login);
  }

  if (session.user.role !== "admin") {
    redirect(appRoutes.routes);
  }

  return (
    <>
      <Header />
      <Container className="pt-10">
        <main className="mx-auto w-full max-w-6xl px-6 pb-10">{children}</main>
      </Container>
    </>
  );
}
