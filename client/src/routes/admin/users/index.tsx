import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { useState } from "react";
import { RoleBadge } from "#/components/ui/role-badge";
import { StatusBadge } from "#/components/ui/status-badge";
import { useUsers } from "#/hooks/use-users";
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
    <div className="mx-auto max-w-lg p-8">
      <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
      <p className="mt-2 text-muted-foreground">
        You need admin privileges to view this page.
      </p>
    </div>
  ),
});

function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const { data, isPending } = useUsers({ search: search || undefined });

  return (
    <div className="mx-auto  p-8">
      <h1 className="text-2xl font-bold">User Management</h1>

      <div className="mt-4">
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
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isPending && (
              <tr>
                <td colSpan={5} className="p-4">
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((id) => (
                      <div
                        key={`skeleton-row-${id}`}
                        className="h-8 animate-pulse rounded bg-muted"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            )}
            {!isPending && data?.users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 opacity-50" />
                    <span>No users found.</span>
                  </div>
                </td>
              </tr>
            )}
            {data?.users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-3">{user.name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to="/admin/users/$id"
                    className="btn"
                    params={{ id: user.id }}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && (
        <p className="mt-2 text-xs text-muted-foreground">
          {data.total} user{data.total !== 1 ? "s" : ""} total
        </p>
      )}
    </div>
  );
}
