import { Box, DropdownMenu, Flex, Separator, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import { Home, Menu, Users } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";
import { AuthButtons } from "#/components/ui/auth-buttons";
import { NavBrand } from "#/components/ui/NavBrand";
import { type NavLink, NavLinks } from "#/components/ui/nav-links";
import { ProfileDropdown } from "#/components/ui/ProfileDropdown";
import { authClient } from "#/lib/auth-client";
import { isAdmin } from "#/lib/auth-guard";
import { mergeClassName } from "#/lib/merge-class-name";

export function Navbar() {
  const { data: session } = authClient.useSession();

  const navLinks: NavLink[] = useMemo(
    () => [
      { to: "/", label: "Home", icon: Home },
      {
        to: "/admin/users",
        label: "Users",
        icon: Users,
        isPublic: isAdmin(session?.user),
      },
    ],
    [session?.user],
  );

  const handleSignOut = async () => {
    await authClient.signOut();
    globalThis.location.href = "/";
  };

  return (
    <Box p={"3"}>
      <Flex justify={"between"} align={"center"} className="w-full">
        <Flex gapX={"3"}>
          <NavBrand className="mr-5" />
          <Box display={{ initial: "none", md: "block" }}>
            <NavLinks links={navLinks} />
          </Box>
        </Flex>
        <Flex gapX={"2"} align={"center"}>
          {session ? (
            <ProfileDropdown user={session.user} onSignOut={handleSignOut} />
          ) : (
            <Box display={{ initial: "none", md: "block" }}>
              <AuthButtons />
            </Box>
          )}
          <SmallScreeNavbar navLinks={navLinks}>
            {!session && <AuthButtons className="flex flex-col space-y-1.5" />}
          </SmallScreeNavbar>
        </Flex>
      </Flex>
    </Box>
  );
}

interface SmallScreeNavbarProps {
  navLinks: NavLink[];
  children?: ReactNode;
}

const SmallScreeNavbar = ({ navLinks, children }: SmallScreeNavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const visibleLinks = navLinks.filter(
    (link) => link.isPublic === undefined || link.isPublic === true,
  );

  return (
    <Box display={{ initial: "block", md: "none" }}>
      <DropdownMenu.Root open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenu.Trigger>
          <button
            type="button"
            className={mergeClassName(
              "p-2 bg-transparent rounded-md hover:bg-accent focus-visible:outline-none",
              isMenuOpen && "bg-accent",
            )}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-6 w-6" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content variant="soft" className="z-50">
          <Box p={"3"}>
            <Flex direction={"column"} gapY={"2"}>
              {visibleLinks.map((link) => (
                <DropdownMenu.Item key={link.to} asChild>
                  <Link
                    to={link.to}
                    className="cursor-pointer px-2 py-1 rounded"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Flex gapX={"2"} align={"center"}>
                      {link.icon && <link.icon className="h-4 w-4" />}
                      <Text as="span">{link.label}</Text>
                    </Flex>
                  </Link>
                </DropdownMenu.Item>
              ))}
              <Separator size={"4"} />
              {children}
            </Flex>
          </Box>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Box>
  );
};
