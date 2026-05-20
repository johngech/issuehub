import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import {
  type User,
  useDeleteUser,
  useToggleUserStatus,
} from "#/hooks/use-users";
import { UserStatus } from "@issue-tracker/core/constants";

interface DangerZoneProps {
  user: User;
  onConfirmAction: (action: "disable" | "enable" | "delete") => void;
}

export function DangerZone({
  user,
  onConfirmAction,
}: Readonly<DangerZoneProps>) {
  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();
  const isDisabled = user.status === UserStatus.DISABLED;

  const toggleButtonText = toggleStatus.isPending
    ? isDisabled
      ? "Enabling..."
      : "Disabling..."
    : isDisabled
      ? "Enable"
      : "Disable";

  return (
    <Box className="mt-8 rounded-lg border border-red-200 bg-red-50/50 p-6">
      <Heading
        as="h2"
        className="text-sm font-semibold uppercase tracking-wide text-red-600"
      >
        Danger Zone
      </Heading>

      <Box className="mt-4 divide-y divide-red-200">
        {/* Disable / Enable */}
        <Flex justify="between" align="center" py="4">
          <Flex direction="column">
            <Text className="text-sm font-medium">
              {isDisabled ? "Enable Account" : "Disable Account"}
            </Text>
            <Text className="text-xs text-muted-foreground">
              {isDisabled
                ? "Allow this user to log in again."
                : "Prevent this user from logging in."}
            </Text>
          </Flex>
          <Button
            variant={isDisabled ? "outline" : "solid"}
            color="red"
            size="2"
            disabled={toggleStatus.isPending}
            onClick={() => {
              onConfirmAction(isDisabled ? "enable" : "disable");
            }}
          >
            {toggleButtonText}
          </Button>
        </Flex>

        {/* Delete */}
        <Flex justify="between" align="center" py="4">
          <Flex direction="column">
            <Text className="text-sm font-medium">Delete Account</Text>
            <Text className="text-xs text-muted-foreground">
              Permanently remove this user and all associated data.
            </Text>
          </Flex>
          <Button
            variant="solid"
            color="red"
            size="2"
            disabled={deleteUser.isPending}
            onClick={() => {
              onConfirmAction("delete");
            }}
          >
            {deleteUser.isPending ? "Deleting..." : "Delete"}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
