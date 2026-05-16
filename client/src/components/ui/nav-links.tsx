import { Link, useLocation } from "@tanstack/react-router";
import { mergeClassName } from "#/lib/merge-class-name";

export interface NavLink {
  to: string;
  label: string;
}

export interface NavLinksProps {
  links: NavLink[];
  className?: string;
  onNavClick?: () => void;
}

export function NavLinks({
  links,
  className,
  onNavClick,
}: Readonly<NavLinksProps>) {
  const location = useLocation();

  if (links.length === 0) return null;

  return (
    <nav
      className={mergeClassName(
        "hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex",
        className,
      )}
    >
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          onClick={onNavClick}
          className={mergeClassName(
            "transition-colors hover:text-foreground",
            location.pathname === link.to &&
              "text-foreground underline underline-offset-4",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
