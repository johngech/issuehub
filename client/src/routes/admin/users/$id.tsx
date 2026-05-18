import type { Role } from "@issue-tracker/core/constants";
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
  const { data: user, isPending } = useUser(id);
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
      <div className="mx-auto max-w-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  const isDisabled = user.status === "DISABLED";

  return (
    <div className="mx-auto max-w-lg p-8">
      <button
        type="button"
        onClick={() => router.history.back()}
        aria-label="Go back to users list"
        className="mb-4 text-sm text-muted-foreground hover:text-foreground focus:outline-none rounded"
      >
        ← Back to users
      </button>

      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="mt-1 text-muted-foreground">{user.email}</p>

      <div className="mt-4 flex gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge status={user.status} />
      </div>

      <div className="mt-8 space-y-6 border-t pt-6">
        {/* Role change */}
        <div>
          <h2 className="text-sm font-medium">Role</h2>
          <div className="mt-2 flex items-center gap-2">
            <RoleSelect
              value={user.role}
              onChange={(role) => {
                setPendingRole(role);
                setConfirmAction("role");
                setConfirmOpen(true);
              }}
            />
          </div>
        </div>

        {/* Disable/enable toggle */}
        <div>
          <h2 className="text-sm font-medium">Account Status</h2>
          <div className="mt-2">
            <Button
              variant={isDisabled ? "classic" : "ghost"}
              size="2"
              disabled={toggleStatus.isPending}
              onClick={() => {
                setConfirmAction("disable");
                setConfirmOpen(true);
              }}
            >
              {toggleStatus.isPending
                ? isDisabled
                  ? "Enabling..."
                  : "Disabling..."
                : isDisabled
                  ? "Enable Account"
                  : "Disable Account"}
            </Button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Created: {new Date(user.createdAt).toLocaleDateString()}
      </p>

      {/* Confirmation dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmAction === "role"
            ? "Change User Role"
            : isDisabled
              ? "Enable User"
              : "Disable User"
        }
        description={
          confirmAction === "role"
            ? `Change ${user.name}'s role to ${pendingRole}?`
            : isDisabled
              ? `Enable ${user.name}'s account? They will be able to log in again.`
              : `Disable ${user.name}'s account? They will no longer be able to log in.`
        }
        confirmLabel={
          confirmAction === "role"
            ? "Change Role"
            : isDisabled
              ? "Enable"
              : "Disable"
        }
        onConfirm={
          confirmAction === "role" ? handleRoleChange : handleToggleStatus
        }
        onCancel={() => {
          setConfirmOpen(false);
          setConfirmAction(null);
          setPendingRole(null);
        }}
      />
    </div>
  );
}
