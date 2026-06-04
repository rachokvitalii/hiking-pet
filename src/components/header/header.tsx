import { Container } from "../container";
import { Logo } from "./logo";
import { Menu } from "./menu";
import { HeaderNavigation } from "./header-navigation";

export const Header = () => {
  return (
    <header className="bg-background border-b">
      <Container className="flex h-16 items-center justify-between">
        <Logo />
        <HeaderNavigation />
        <Menu />
      </Container>
    </header>
  );
};
