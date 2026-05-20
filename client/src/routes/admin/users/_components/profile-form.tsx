import {
  type UpdateProfileInput,
  updateProfileSchema,
} from "@issue-tracker/core/validation";
import { Box, Button, Flex, Heading, Text } from "@radix-ui/themes";
import { useState } from "react";
import { Form, FormField } from "#/components/forms";
import { type User, useUpdateUserProfile } from "#/hooks/use-users";

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: Readonly<ProfileFormProps>) {
  const updateProfile = useUpdateUserProfile();
  const [successMsg, setSuccessMsg] = useState("");

  const handleProfileSubmit = async (values: UpdateProfileInput) => {
    await updateProfile.mutateAsync({ userId: user.id, data: values });
    setSuccessMsg("Profile updated");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const profileInitialValues: UpdateProfileInput = {
    name: user.name ?? "",
    email: user.email ?? "",
  };

  return (
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
        <FormField name="name" label="Name" placeholder="Enter name" required />
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
  );
}
