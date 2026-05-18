import { Flex, Text } from "@radix-ui/themes";
import { Link, useLocation } from "@tanstack/react-router";
import type { ComponentType } from "react";

export interface NavLink {
  icon?: ComponentType<{ className: string }>;
  to: string;
  label: string;
  isPublic?: boolean;
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

  const visibleLinks = links.filter(
    (link) => link.isPublic === undefined || link.isPublic === true,
  );

  if (visibleLinks.length === 0) return null;

  return (
    <Flex className={className} gapX={"3"}>
      {visibleLinks.map((link) => (
        <Link key={link.to} to={link.to} onClick={onNavClick}>
          <Text
            as="span"
            className={location.pathname === link.to ? "text-blue-500" : ""}
          >
            {link.label}
          </Text>
        </Link>
      ))}
    </Flex>
  );
}
