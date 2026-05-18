import { Role } from "@issue-tracker/core/constants";
import { Flex, Select } from "@radix-ui/themes";

const ROLES = [
  { value: Role.ADMIN, label: "Admin" },
  { value: Role.AGENT, label: "Agent" },
  { value: Role.USER, label: "User" },
];

interface RoleSelectProps {
  value: Role;
  onChange: (role: Role) => void;
  disabled?: boolean;
}

export function RoleSelect({
  value,
  onChange,
  disabled,
}: Readonly<RoleSelectProps>) {
  return (
    <Flex gap={"2"}>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger />
        <Select.Content>
          <Select.Label>Select Role</Select.Label>
          {ROLES.map((role) => (
            <Select.Item key={role.value} value={role.value}>
              {role.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}
