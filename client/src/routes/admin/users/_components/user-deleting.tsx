import { Box, Flex, Text } from "@radix-ui/themes";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

interface UserDeletingProps {
  userName: string;
}

export function UserDeleting({ userName }: Readonly<UserDeletingProps>) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/admin/users" });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box className="mx-auto max-w-lg p-8">
      <Box className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
        <Flex direction="column" align="center" gap="3">
          <Box className="h-8 w-8 animate-spin rounded-full border-4 border-yellow-600 border-t-transparent" />
          <Text className="text-lg font-medium text-yellow-800">
            Deleting {userName}...
          </Text>
          <Text className="text-sm text-yellow-700">
            Please wait while we remove this account.
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
