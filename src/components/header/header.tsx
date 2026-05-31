import Link from "next/link";
import { Container } from "../container";
import { Logo } from "./logo";
import { Menu } from "./menu";
import { routes } from "~/shared/routes";

export const Header = () => {
  return (
    <header className="bg-background border-b">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <Link
          className="cursor-pointer text-sm font-medium hover:underline"
          href={routes.routes}
        >
          Routes
        </Link>
        <Menu />
      </Container>
    </header>
  );
};
