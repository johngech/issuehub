import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { RoleBadge } from "#/components/ui/role-badge";
import { StatusBadge } from "#/components/ui/status-badge";
import type { User } from "#/hooks/use-users";

interface UserProfileHeaderProps {
  user: User;
}

export function UserProfileHeader({ user }: Readonly<UserProfileHeaderProps>) {
  const navigate = useNavigate();

  return (
    <Box>
      <button
        type="button"
        onClick={() => navigate({ to: "/admin/users" })}
        aria-label="Go back to users list"
        className="mb-4 text-sm text-muted-foreground cursor-pointer hover:border-l-pink-300 focus:outline-none rounded"
      >
        <Flex gapX={"2"}>
          <ArrowLeft size={20} />
          <Text as="span">Back to users</Text>
        </Flex>
      </button>
      <Flex gapY={"2"} direction={"column"}>
        <Heading className="text-2xl font-bold">{user.name}</Heading>
        <Text className="mt-1 text-muted-foreground">{user.email}</Text>

        <Flex gap={"2"}>
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </Flex>
      </Flex>
    </Box>
  );
}
