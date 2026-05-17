import type { UserStatus } from "@issue-tracker/core/constants";

const STATUS_STYLES: Record<UserStatus, string> = {
  ACTIVE:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  DISABLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}
