import type { Role } from "@issue-tracker/core/constants";
import { Box, Heading, Text } from "@radix-ui/themes";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { ConfirmDialog } from "#/components/ui/confirm-dialog";
import { RoleBadge } from "#/components/ui/role-badge";
import { RoleSelect } from "#/components/ui/role-select";
import { StatusBadge } from "#/components/ui/status-badge";
import { useChangeRole, useToggleUserStatus, useUser } from "#/hooks/use-users";
import { authClient } from "#/lib/auth-client";
import { isAdmin } from "#/lib/auth-guard";

export const Route = createFileRoute("/admin/users/$id")({
  component: AdminUserDetailPage,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    if (!isAdmin(session?.user)) {
      throw new Error("Unauthorized");
    }
  },
  errorComponent: () => (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
      <p className="mt-2 text-muted-foreground">
        You need admin privileges to view this page.
      </p>
    </div>
  ),
});

function AdminUserDetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { data: user, isPending, error } = useUser(id);
  const changeRole = useChangeRole();
  const toggleStatus = useToggleUserStatus();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"role" | "disable" | null>(
    null,
  );
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const handleRoleChange = async () => {
    if (!user || !pendingRole) return;
    await changeRole.mutateAsync({ userId: user.id, role: pendingRole });
    setConfirmOpen(false);
    setConfirmAction(null);
    setPendingRole(null);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    await toggleStatus.mutateAsync(user.id);
    setConfirmOpen(false);
    setConfirmAction(null);
  };

  if (isPending) {
    return (
      <Box className="mx-auto max-w-lg p-8">
        <Box className="animate-pulse space-y-4">
          <Box className="h-8 w-48 rounded bg-muted" />
          <Box className="h-10 w-full rounded bg-muted" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="mx-auto max-w-lg p-8">
        <Heading className="text-2xl font-bold text-destructive">
          Error Loading User
        </Heading>
        <Text className="mt-2 text-muted-foreground">
          {error.message || "Unable to load user details. Please try again."}
        </Text>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to users
        </button>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="mx-auto max-w-lg p-8">
        <Heading className="text-2xl font-bold">User not found</Heading>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to users
        </button>
      </Box>
    );
  }

  const isDisabled = user.status === "DISABLED";

  const confirmConfig = {
    role: {
      title: "Change User Role",
      description: `Change ${user.name}'s role to ${pendingRole}?`,
      confirmLabel: "Change Role",
    },
    disable: {
      title: "Disable User",
      description: `Disable ${user.name}'s account? They will no longer be able to log in.`,
      confirmLabel: "Disable",
    },
    enable: {
      title: "Enable User",
      description: `Enable ${user.name}'s account? They will be able to log in again.`,
      confirmLabel: "Enable",
    },
  } as const;

  const statusAction = isDisabled ? "enable" : "disable";
  const statusButtonText = toggleStatus.isPending
    ? `${statusAction === "enable" ? "Enabling" : "Disabling"}...`
    : `${statusAction === "enable" ? "Enable" : "Disable"} Account`;

  const activeConfirm = confirmAction
    ? confirmConfig[
        confirmAction === "disable" && isDisabled ? "enable" : confirmAction
      ]
    : confirmConfig.disable;

  return (
    <Box className="mx-auto max-w-lg p-8">
      <button
        type="button"
        onClick={() => router.history.back()}
        aria-label="Go back to users list"
        className="mb-4 text-sm text-muted-foreground hover:text-foreground focus:outline-none rounded"
      >
        ← Back to users
      </button>

      <Heading className="text-2xl font-bold">{user.name}</Heading>
      <Text className="mt-1 text-muted-foreground">{user.email}</Text>

      <Box className="mt-4 flex gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge status={user.status} />
      </Box>

      <Box className="mt-8 space-y-6 border-t pt-6">
        <Box>
          <Heading as="h2" className="text-sm font-medium">
            Role
          </Heading>
          <Box className="mt-2 flex items-center gap-2">
            <RoleSelect
              value={user.role}
              onChange={(role) => {
                setPendingRole(role);
                setConfirmAction("role");
                setConfirmOpen(true);
              }}
            />
          </Box>
        </Box>
        <Box>
          <Heading as="h2" className="text-sm font-medium">
            Account Status
          </Heading>
          <Box className="mt-2">
            <Button
              variant={isDisabled ? "classic" : "ghost"}
              size="2"
              disabled={toggleStatus.isPending}
              onClick={() => {
                setConfirmAction("disable");
                setConfirmOpen(true);
              }}
            >
              {statusButtonText}
            </Button>
          </Box>
        </Box>
      </Box>

      <p className="mt-2 text-xs text-muted-foreground">
        Created: {new Date(user.createdAt).toLocaleDateString()}
      </p>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={activeConfirm.title}
        description={activeConfirm.description}
        confirmLabel={activeConfirm.confirmLabel}
        onConfirm={
          confirmAction === "role" ? handleRoleChange : handleToggleStatus
        }
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
          setPendingRole(null);
        }}
      />
    </Box>
  );
}
