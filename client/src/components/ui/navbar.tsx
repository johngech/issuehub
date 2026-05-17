import { Menu, X } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { AuthButtons } from "#/components/ui/auth-buttons";
import { MobileMenu } from "#/components/ui/mobile-menu";
import { NavBrand } from "#/components/ui/nav-brand";
import type { NavLink } from "#/components/ui/nav-links";
import { NavLinks } from "#/components/ui/nav-links";
import { UserDropdown } from "#/components/ui/user-dropdown";
import { authClient } from "#/lib/auth-client";
import { isAdmin } from "#/lib/auth-guard";

export function Navbar() {
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks: NavLink[] = useMemo(
    () => [
      { to: "/", label: "Home" },
      ...(isAdmin(session?.user)
        ? [{ to: "/admin/users", label: "Users" }]
        : []),
    ],
    [session?.user],
  );

  const handleSignOut = async () => {
    await authClient.signOut();
    globalThis.location.href = "/";
  };

  let desktopAuth: ReactNode;
  if (isPending) {
    desktopAuth = (
      <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
    );
  } else if (session) {
    desktopAuth = (
      <UserDropdown user={session.user} onSignOut={handleSignOut} />
    );
  } else {
    desktopAuth = <AuthButtons />;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <NavBrand />
          <NavLinks links={navLinks} />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">{desktopAuth}</div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        isPending={isPending}
        session={session ?? undefined}
        onSignOut={handleSignOut}
      />
    </header>
  );
}
