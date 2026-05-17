import { Role } from "@issue-tracker/core/constants";

const ROLES = [
  { value: Role.ADMIN, label: "Admin" },
  { value: Role.AGENT, label: "Agent" },
  { value: Role.USER, label: "User" },
];

export function RoleSelect({
  value,
  onChange,
}: {
  value: Role;
  onChange: (role: Role) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Role)}
      className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
    >
      {ROLES.map((role) => (
        <option key={role.value} value={role.value}>
          {role.label}
        </option>
      ))}
    </select>
  );
}
