import { UserStatus, type Role } from "@issue-tracker/core/constants";
import {
  type UpdateProfileInput,
  updateProfileSchema,
} from "@issue-tracker/core/validation";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Form, FormField } from "#/components/forms";
import { ConfirmDialog } from "#/components/ui/confirm-dialog";
import { RoleBadge } from "#/components/ui/role-badge";
import { RoleSelect } from "#/components/ui/role-select";
import { StatusBadge } from "#/components/ui/status-badge";
import {
  useChangeRole,
  useDeleteUser,
  useToggleUserStatus,
  useUpdateUserProfile,
  useUser,
} from "#/hooks/use-users";
import { authClient } from "#/lib/auth-client";
import { isAdmin } from "#/lib/auth-guard";
import { ArrowLeft } from "lucide-react";

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
  const navigate = useNavigate();
  const { data: user, isPending, error } = useUser(id);
  const changeRole = useChangeRole();
  const toggleStatus = useToggleUserStatus();
  const updateProfile = useUpdateUserProfile();
  const deleteUser = useDeleteUser();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

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
    navigate({ to: "/admin/users" });
    await deleteUser.mutateAsync(user.id);
  };

  const handleProfileSubmit = async (values: UpdateProfileInput) => {
    if (!user) return;
    await updateProfile.mutateAsync({ userId: user.id, data: values });
    setSuccessMsg("Profile updated");
    setTimeout(() => setSuccessMsg(""), 3000);
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
          onClick={() => navigate({ to: "/admin/users" })}
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
          onClick={() => navigate({ to: "/admin/users" })}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to users
        </button>
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

  const profileInitialValues: UpdateProfileInput = {
    name: user.name ?? "",
    email: user.email ?? "",
  };

  return (
    <Box className="mx-auto max-w-lg p-8">
      {/* Delete in progress indicator */}
      {deleteUser.isPending && (
        <Box className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <Flex align="center" gap="2">
            <Box className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
            <Text className="text-sm text-yellow-800">
              Deleting user account...
            </Text>
          </Flex>
        </Box>
      )}

      <button
        type="button"
        onClick={() => navigate({ to: "/admin/users" })}
        aria-label="Go back to users list"
        className="mb-4 text-sm text-muted-foreground cursor-pointer hover:border-l-pink-300 focus:outline-none rounded"
      >
        <Flex gapX={"2"}>
          <ArrowLeft size={20} />
          <Text as="span">Back to users</Text>
        </Flex>
      </button>

      <Heading className="text-2xl font-bold">{user.name}</Heading>
      <Text className="mt-1 text-muted-foreground">{user.email}</Text>

      <Box className="mt-4 flex gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge status={user.status} />
      </Box>

      {/* Profile update form */}
      <Box className="mt-8 space-y-6 border-t pt-6">
        <Heading as="h2" className="text-sm font-medium">
          Profile
        </Heading>
        <Form
          validationSchema={updateProfileSchema}
          initialValues={profileInitialValues}
          onSubmit={handleProfileSubmit}
          className="space-y-4"
        >
          <FormField
            name="name"
            label="Name"
            placeholder="Enter name"
            required
          />
          <FormField
            name="email"
            label="Email"
            type="email"
            placeholder="Enter email"
            required
          />
          <Flex gap="3" align="center">
            <Button
              type="submit"
              disabled={updateProfile.isPending}
              loading={updateProfile.isPending}
            >
              Save Changes
            </Button>
            {successMsg && (
              <Text className="text-sm text-green-500">{successMsg}</Text>
            )}
            {updateProfile.error && (
              <Text className="text-sm text-red-500">
                {updateProfile.error.message}
              </Text>
            )}
          </Flex>
        </Form>
      </Box>

      {/* Role management */}
      <Box className="mt-8 space-y-6 border-t pt-6">
        <Heading as="h2" className="text-sm font-medium">
          Role
        </Heading>
        <RoleSelect
          value={user.role}
          onChange={(role) => {
            setPendingRole(role);
            setConfirmAction("role");
            setConfirmOpen(true);
          }}
        />
      </Box>

      {/* Danger zone */}
      <Box className="mt-8 rounded-lg border border-red-200 bg-red-50/50 p-6">
        <Heading
          as="h2"
          className="text-sm font-semibold uppercase tracking-wide text-red-600"
        >
          Danger Zone
        </Heading>

        <Box className="mt-4 divide-y divide-red-200">
          {/* Disable / Enable */}
          <Flex justify="between" align="center" py="4">
            <Flex direction="column">
              <Text className="text-sm font-medium">
                {isDisabled ? "Enable Account" : "Disable Account"}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {isDisabled
                  ? "Allow this user to log in again."
                  : "Prevent this user from logging in."}
              </Text>
            </Flex>
            <Button
              variant={isDisabled ? "outline" : "solid"}
              color="red"
              size="2"
              disabled={toggleStatus.isPending}
              onClick={() => {
                setConfirmAction(isDisabled ? "enable" : "disable");
                setConfirmOpen(true);
              }}
            >
              {toggleStatus.isPending
                ? isDisabled
                  ? "Enabling..."
                  : "Disabling..."
                : isDisabled
                  ? "Enable"
                  : "Disable"}
            </Button>
          </Flex>

          {/* Delete */}
          <Flex justify="between" align="center" py="4">
            <Flex direction="column">
              <Text className="text-sm font-medium">Delete Account</Text>
              <Text className="text-xs text-muted-foreground">
                Permanently remove this user and all associated data.
              </Text>
            </Flex>
            <Button
              variant="solid"
              color="red"
              size="2"
              disabled={deleteUser.isPending}
              onClick={() => {
                setConfirmAction("delete");
                setConfirmOpen(true);
              }}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </Button>
          </Flex>
        </Box>
      </Box>

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
          onConfirm={
            confirmAction === "role"
              ? handleRoleChange
              : confirmAction === "delete"
                ? handleDelete
                : handleToggleStatus
          }
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
