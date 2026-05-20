import type { Role } from "@issue-tracker/core/constants";
import { Box, Heading } from "@radix-ui/themes";
import { RoleSelect } from "#/components/ui/role-select";
import type { User } from "#/hooks/use-users";

interface RoleManagementProps {
  user: User;
  onConfirmAction: (action: "role", role: Role) => void;
}

export function RoleManagement({
  user,
  onConfirmAction,
}: Readonly<RoleManagementProps>) {
  return (
    <Box className="mt-8 space-y-6 border-t pt-6">
      <Heading as="h2" className="text-sm font-medium">
        Role
      </Heading>
      <RoleSelect
        value={user.role}
        onChange={(role) => {
          onConfirmAction("role", role);
        }}
      />
    </Box>
  );
}
