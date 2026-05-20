import type { Role, UserStatus } from "@issue-tracker/core/constants";
import { prisma } from "../../prisma/client";

export interface UserFilters {
  search?: string;
  skip?: number;
  take?: number;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}

export const userRepository = {
  async findById(id: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user as UserRecord | null;
  },

  async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user as UserRecord | null;
  },

  async findAll({ search, skip = 0, take = 20 }: UserFilters = {}): Promise<{
    users: UserRecord[];
    total: number;
  }> {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);

    return { users: users as UserRecord[], total };
  },

  async update(
    id: string,
    data: { name?: string; email?: string; role?: Role; status?: UserStatus },
  ): Promise<UserRecord> {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user as UserRecord;
  },

  async updateRole(id: string, role: Role): Promise<UserRecord> {
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user as UserRecord;
  },

  async toggleStatus(id: string): Promise<UserRecord> {
    const current = await prisma.user.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!current) {
      throw new Error("User not found");
    }

    const newStatus = current.status === "ACTIVE" ? "DISABLED" : "ACTIVE";

    const user = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    return user as UserRecord;
  },

  async countByRole(role: Role): Promise<number> {
    return prisma.user.count({ where: { role } });
  },

  async deleteById(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  },
};
