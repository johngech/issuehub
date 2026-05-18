import { Form, FormField } from "#/components/forms";
import { Button } from "#/components/ui/button";
import { RoleBadge } from "#/components/ui/role-badge";
import { StatusBadge } from "#/components/ui/status-badge";
import { useCurrentUser, useUpdateProfile } from "#/hooks/use-users";
import { authClient } from "#/lib/auth-client";
import {
  type UpdateProfileInput,
  updateProfileSchema,
} from "@issue-tracker/core/validation";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/profile/")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data, isPending } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [success, setSuccess] = useState(false);

  if (isPending) {
    return (
      <Box className="mx-auto max-w-lg p-8">
        <Box className="animate-pulse space-y-4">
          <Box className="h-8 w-48 rounded bg-muted" />
          <Box className="h-10 w-full rounded bg-muted" />
          <Box className="h-10 w-full rounded bg-muted" />
        </Box>
      </Box>
    );
  }

  const user = data?.user;
  if (!user) {
    return (
      <Box className="mx-auto max-w-lg p-8">
        <Heading className="text-2xl font-bold">Profile not found</Heading>
        <Text className="mt-2 text-muted-foreground">
          Unable to load your profile. Please try again.
        </Text>
      </Box>
    );
  }

  const initialValues: UpdateProfileInput = {
    name: user.name ?? "",
    email: user.email ?? "",
  };

  const onSubmit = async (values: UpdateProfileInput) => {
    setSuccess(false);
    await updateProfile.mutateAsync(values);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Box className="mx-auto max-w-lg" p={"4"}>
      <Heading className="text-2xl font-bold">Profile</Heading>

      <Flex mt={"3"} gapX={"3"}>
        <RoleBadge role={user.role} />
        <StatusBadge status={user.status} />
      </Flex>

      <Form
        validationSchema={updateProfileSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
        className="mt-6 space-y-4"
      >
        <FormField
          name="name"
          label="Name"
          placeholder="Enter your name"
          required
        />

        <FormField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />

        <Flex gap={"3"}>
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>

          {success && (
            <Text
              role="status"
              aria-live="polite"
              className="text-sm text-green-400"
            >
              Profile updated!
            </Text>
          )}
          {updateProfile.error && (
            <Text className="text-sm text-red-400">
              {updateProfile.error.message}
            </Text>
          )}
        </Flex>
      </Form>

      <Box mt={"3"}>
        <Button
          variant="soft"
          className="cursor-pointer"
          onClick={async () => {
            await authClient.signOut();
            globalThis.location.href = "/";
          }}
        >
          <Text className="text-red-400">Sign Out</Text>
        </Button>
      </Box>
    </Box>
  );
}
