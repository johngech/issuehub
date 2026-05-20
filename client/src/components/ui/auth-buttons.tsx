import { Button, Flex } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";

interface AuthButtonsProps {
  onNavClick?: () => void;
  className?: string;
}

export function AuthButtons({
  onNavClick,
  ...props
}: Readonly<AuthButtonsProps>) {
  return (
    <Flex gapX={"2"} {...props}>
      <Link to="/signin" onClick={onNavClick}>
        <Button variant="soft">Sign In</Button>
      </Link>

      <Link to="/signup" onClick={onNavClick}>
        <Button variant="solid">Sign Up</Button>
      </Link>
    </Flex>
  );
}
