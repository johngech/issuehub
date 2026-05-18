import type { UserStatus } from "@issue-tracker/core/constants";
import { Badge } from "@radix-ui/themes";

const STATUS_STYLES: Record<
  UserStatus,
  { label: string; color: "red" | "green" }
> = {
  ACTIVE: {
    label: "active",
    color: "green",
  },
  DISABLED: {
    label: "In-active",
    color: "red",
  },
};

export function StatusBadge({ status }: Readonly<{ status: UserStatus }>) {
  const { color, label } = STATUS_STYLES[status];

  return <Badge color={color}>{label}</Badge>;
}
