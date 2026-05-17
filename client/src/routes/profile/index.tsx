import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { RoleBadge } from "#/components/ui/role-badge";
import { StatusBadge } from "#/components/ui/status-badge";
import { useCurrentUser, useUpdateProfile } from "#/hooks/use-users";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data, isPending } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      name: data?.user.name ?? "",
      email: data?.user.email ?? "",
    },
    values: {
      name: data?.user.name ?? "",
      email: data?.user.email ?? "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setSuccess(false);
    await updateProfile.mutateAsync(values);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
          <div className="h-10 w-full rounded bg-muted" />
        </div>
      </div>
    );
  }

  const user = data?.user;
  if (!user) return null;

  return (
    <div className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="mt-6 flex gap-2">
        <RoleBadge role={user.role} />
        <StatusBadge status={user.status} />
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>

          {success && (
            <span className="text-sm text-green-600">Profile updated!</span>
          )}
          {updateProfile.error && (
            <span className="text-sm text-red-600">
              {updateProfile.error.message}
            </span>
          )}
        </div>
      </form>

      <div className="mt-8 border-t pt-4">
        <Button
          variant="outline"
          onClick={async () => {
            await authClient.signOut();
            globalThis.location.href = "/";
          }}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
