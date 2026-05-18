import { getInitials } from "#/lib/get-initials";
import { Avatar, Box, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import { LogOut, Settings, User } from "lucide-react";

export interface ProfileDropdownProps {
  name: string | null;
  email: string;
  image?: string | null;
  role?: string;
}

export interface UserDropdownProps {
  user: ProfileDropdownProps;
  onSignOut: () => void;
}

export function ProfileDropdown({
  user,
  onSignOut,
}: Readonly<UserDropdownProps>) {
  return (
    <Box className="outline-none">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button
            type="button"
            className="cursor-pointer outline-none rounded-full  border-0 bg-transparent p-0"
          >
            <Avatar
              src={user.image ?? undefined}
              alt={user.name ?? "User avatar"}
              fallback={getInitials(user.name)}
              size="3"
              radius="full"
            />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content variant="soft" className="p-4">
          <Flex gapY={"2"} direction={"column"}>
            <DropdownMenu.Label className="mb-3">
              <Flex direction={"column"} gapY={"2"}>
                <Text>{user.name ?? "User"}</Text>
                <Text>{user.email}</Text>
              </Flex>
            </DropdownMenu.Label>

            <DropdownMenu.Item asChild>
              <Link to="/profile">
                <Flex gapX={"2"} align={"center"}>
                  <User className="h-4 w-4" />
                  <Text as="span">Profile</Text>
                </Flex>
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item>
              <Link to="/">
                <Flex gapX={"2"} align={"center"}>
                  <Settings className="h-4 w-4" />
                  <Text as="span">Settings</Text>
                </Flex>
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item onSelect={onSignOut}>
              <Flex gapX={"2"} className="text-red-400">
                <LogOut className="h-4 w-4" />
                <Text as="span">Sign out</Text>
              </Flex>
            </DropdownMenu.Item>
          </Flex>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Box>
  );
}
