import type { Role, UserStatus } from "@issue-tracker/core/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "#/lib/api";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
}

interface MeResponse {
  user: PublicUser;
  session: unknown;
}

interface UserListResponse {
  users: PublicUser[];
  total: number;
}

// ─── Current user ───

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api<MeResponse>("/api/me"),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      api<PublicUser>("/api/me", { method: "PUT", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

// ─── Admin: user list ───

export function useUsers(params?: {
  search?: string;
  skip?: number;
  take?: number;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => {
      const qs = new URLSearchParams();
      if (params?.search) qs.set("search", params.search);
      if (params?.skip !== undefined) qs.set("skip", String(params.skip));
      if (params?.take !== undefined) qs.set("take", String(params.take));
      const query = qs.toString() ? `?${qs.toString()}` : "";
      return api<UserListResponse>(`/api/users${query}`);
    },
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => api<PublicUser>(`/api/users/${id}`),
    enabled: !!id,
  });
}

// ─── Admin: change role ───

export function useChangeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      api<PublicUser>(`/api/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", variables.userId] });
    },
  });
}

// ─── Admin: toggle user status ───

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      api<PublicUser>(`/api/users/${userId}/disable`, {
        method: "PATCH",
      }),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
    },
  });
}
