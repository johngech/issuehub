import type { Role } from "@issue-tracker/core/constants";

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  AGENT: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  USER: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_STYLES[role]}`}
    >
      {role}
    </span>
  );
}
