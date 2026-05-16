import { Link, useLocation } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { AuthButtons } from "#/components/ui/auth-buttons";
import { Avatar } from "#/components/ui/avatar";
import { Button } from "#/components/ui/button";
import type { NavLink } from "#/components/ui/nav-links";
import { getInitials } from "#/lib/get-initials";
import { mergeClassName } from "#/lib/merge-class-name";

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavLink[];
  isPending: boolean;
  session?: {
    user: {
      name: string | null;
      email: string;
      image?: string | null;
    };
  };
  onSignOut: () => void;
}

export function MobileMenu({
  isOpen,
  onClose,
  links,
  isPending,
  session,
  onSignOut,
}: Readonly<MobileMenuProps>) {
  const location = useLocation();

  if (!isOpen) return null;

  let authContent: ReactNode;
  if (isPending) {
    authContent = (
      <div className="h-9 w-full animate-pulse rounded-md bg-muted" />
    );
  } else if (session) {
    authContent = (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar
            src={session.user.image || undefined}
            alt={session.user.name || "User avatar"}
            fallback={getInitials(session.user.name)}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium text-foreground">
              {session.user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    );
  } else {
    authContent = <AuthButtons onNavClick={onClose} className="flex-col" />;
  }

  return (
    <dialog
      aria-label="Navigation menu"
      className="border-border border-t bg-background md:hidden"
    >
      <div className="space-y-1 px-4 pb-3 pt-2">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={mergeClassName(
              "block rounded-md px-3 py-2 text-base font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              location.pathname === link.to &&
                "bg-accent text-accent-foreground",
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="border-border border-t px-4 py-3">{authContent}</div>
    </dialog>
  );
}
