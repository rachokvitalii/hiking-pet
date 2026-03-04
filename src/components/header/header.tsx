import { Container } from "../container";
import { Logo } from "./logo";
import { Menu } from "./menu";

export const Header = () => {
  return (
    <header className="border-b bg-background">
      <Container className="flex items-center justify-between h-16">
        <Logo />
        <Menu />
      </Container>
    </header>
  )
}