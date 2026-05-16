import { Link } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { mergeClassName } from "#/lib/merge-class-name";

export interface AuthButtonsProps {
  onNavClick?: () => void;
  className?: string;
}

export function AuthButtons({
  onNavClick,
  className,
}: Readonly<AuthButtonsProps>) {
  return (
    <div className={mergeClassName("flex items-center gap-2", className)}>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/signin" onClick={onNavClick}>
          Sign In
        </Link>
      </Button>
      <Button variant="default" size="sm" asChild>
        <Link to="/signup" onClick={onNavClick}>
          Sign Up
        </Link>
      </Button>
    </div>
  );
}
