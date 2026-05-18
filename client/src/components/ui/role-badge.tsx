import type { Role } from "@issue-tracker/core/constants";
import { Badge } from "@radix-ui/themes";

const ROLES: Record<
  Role,
  { label: string; color: "blue" | "green" | "violet" }
> = {
  ADMIN: {
    label: "Admin",
    color: "blue",
  },
  AGENT: {
    label: "Agent",
    color: "green",
  },
  USER: {
    label: "User",
    color: "violet",
  },
};

export function RoleBadge({ role }: Readonly<{ role: Role }>) {
  const { color, label } = ROLES[role];
  return <Badge color={color}>{label}</Badge>;
}
