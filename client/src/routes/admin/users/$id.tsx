import { type Role, UserStatus } from "@issue-tracker/core/constants";
import { Box, Text } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ConfirmDialog } from "#/components/ui/confirm-dialog";
import {
  useChangeRole,
  useDeleteUser,
  useToggleUserStatus,
  useUser,
} from "#/hooks/use-users";
import { authClient } from "#/lib/auth-client";
import { isAdmin } from "#/lib/auth-guard";
import { DangerZone } from "./_components/danger-zone";
import { ProfileForm } from "./_components/profile-form";
import { RoleManagement } from "./_components/role-management";
import { UserDeleting } from "./_components/user-deleting";
import { UserProfileHeader } from "./_components/user-profile-header";

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

type ConfirmAction = "role" | "disable" | "enable" | "delete" | null;

function AdminUserDetailPage() {
  const { id } = Route.useParams();
  const { data: user, isPending, error } = useUser(id);
  const changeRole = useChangeRole();
  const toggleStatus = useToggleUserStatus();
  const deleteUser = useDeleteUser();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isDisabled = user?.status === "DISABLED";

  const handleRoleChange = async () => {
    if (!user || !pendingRole) return;
    setConfirmOpen(false);
    setConfirmAction(null);
    await changeRole.mutateAsync({ userId: user.id, role: pendingRole });
    setPendingRole(null);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    const newStatus = isDisabled ? UserStatus.ACTIVE : UserStatus.DISABLED;
    setConfirmOpen(false);
    setConfirmAction(null);
    await toggleStatus.mutateAsync({ userId: user.id, status: newStatus });
  };

  const handleDelete = async () => {
    if (!user) return;
    setConfirmOpen(false);
    setConfirmAction(null);
    setIsDeleting(true);
    try {
      await deleteUser.mutateAsync(user.id);
    } catch {
      setIsDeleting(false);
    }
  };

  const handleOnConfirm = () => {
    if (confirmAction === "role") {
      handleRoleChange();
    } else if (confirmAction === "delete") {
      handleDelete();
    } else {
      handleToggleStatus();
    }
  };

  if (isDeleting) {
    return <UserDeleting userName={user?.name ?? "User"} />;
  }

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
        <Text className="text-2xl font-bold text-destructive">
          Error Loading User
        </Text>
        <Text className="mt-2 text-muted-foreground">
          {error.message || "Unable to load user details. Please try again."}
        </Text>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box className="mx-auto max-w-lg p-8">
        <Text className="text-2xl font-bold">User not found</Text>
      </Box>
    );
  }

  const confirmConfig: Record<
    NonNullable<ConfirmAction>,
    { title: string; description: string; confirmLabel: string }
  > = {
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
    delete: {
      title: "Delete User",
      description: `Permanently delete ${user.name}'s account? This action cannot be undone.`,
      confirmLabel: "Delete",
    },
  };

  const activeConfirm = confirmAction ? confirmConfig[confirmAction] : null;

  return (
    <Box className="mx-auto max-w-lg p-8">
      <UserProfileHeader user={user} />
      <ProfileForm user={user} />
      <RoleManagement
        user={user}
        onConfirmAction={(action, role) => {
          setPendingRole(role);
          setConfirmAction(action);
          setConfirmOpen(true);
        }}
      />
      <DangerZone
        user={user}
        onConfirmAction={(action) => {
          setConfirmAction(action);
          setConfirmOpen(true);
        }}
      />

      <Text className="mt-4 text-xs text-muted-foreground">
        Created: {new Date(user.createdAt).toUTCString()}
      </Text>

      {/* Confirmation dialog */}
      {activeConfirm && (
        <ConfirmDialog
          open={confirmOpen}
          title={activeConfirm.title}
          description={activeConfirm.description}
          confirmLabel={activeConfirm.confirmLabel}
          onConfirm={handleOnConfirm}
          onCancel={() => {
            setConfirmOpen(false);
            setConfirmAction(null);
            setPendingRole(null);
          }}
        />
      )}
    </Box>
  );
}
