import { Container } from "../container";
import { Logo } from "./logo";
import { Menu } from "./menu";
import { HeaderNavigation } from "./header-navigation";
import { auth } from "~/server/auth";

export const Header = async () => {
  const session = await auth();
  const isAdmin = session?.user.role === "admin";

  return (
    <header className="bg-background border-b">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <HeaderNavigation isAdmin={isAdmin} />
        <Menu />
      </Container>
    </header>
  );
};
