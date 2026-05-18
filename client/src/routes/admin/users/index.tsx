import { Box, Heading, Text } from "@radix-ui/themes";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import UsersTable from "#/components/UsersTable";
import { authClient } from "#/lib/auth-client";
import { isAdmin } from "#/lib/auth-guard";

export const Route = createFileRoute("/admin/users/")({
  component: AdminUsersPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!isAdmin(session.data?.user)) {
      throw new Error("Unauthorized");
    }
  },
  errorComponent: () => (
    <Box className="mx-auto max-w-lg p-8">
      <Heading className="text-2xl font-bold text-destructive">
        Access Denied
      </Heading>
      <Text className="mt-2 text-muted-foreground">
        You need admin privileges to view this page.
      </Text>
    </Box>
  ),
});

function AdminUsersPage() {
  const [search, setSearch] = useState("");

  return (
    <Box className="mx-auto p-8">
      <Heading className="text-2xl font-bold">User Management</Heading>

      <Box className="mt-4">
        <label htmlFor="user-search" className="text-sm font-medium">
          Search
        </label>
        <input
          id="user-search"
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search users"
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </Box>

      <UsersTable search={search} />
    </Box>
  );
}
