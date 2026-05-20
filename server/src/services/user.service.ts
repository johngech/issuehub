import { Role, UserStatus } from "@issue-tracker/core/constants";
import { z } from "zod";
import { can } from "../auth/authorization";
import { userRepository } from "../repositories/user.repository";

// Email validation schema
const emailSchema = z.email("Invalid email format");

// Custom error class for authorization failures
export class ForbiddenError extends Error {
  code = "FORBIDDEN";
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

// Custom error class for not-found failures
export class NotFoundError extends Error {
  code = "NOT_FOUND";
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

// Custom error class for conflict failures
export class ConflictError extends Error {
  code = "CONFLICT";
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

// Custom error class for validation failures
export class ValidationError extends Error {
  code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validate email format
 * @param email - Email string to validate
 * @throws ValidationError if email is invalid
 */
export function validateEmail(email: string): void {
  const validation = emailSchema.safeParse(email);
  if (!validation.success) {
    throw new ValidationError(validation.error.message);
  }
}

/**
 * User service — business logic with authorization checks.
 *
 * Defense in depth: even though middleware checks roles,
 * services re-verify permissions for safety.
 */
export const userService = {
  /**
   * Get current user's own profile.
   */
  async getOwnProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  /**
   * Update own profile (name and/or email).
   * Only the user themselves can do this.
   */
  async updateProfile(userId: string, data: { name?: string; email?: string }) {
    // Validate email format if provided
    if (data.email) {
      validateEmail(data.email);

      // If changing email, ensure it's not already taken
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== userId) {
        throw new ConflictError("Email already in use");
      }
    }

    return userRepository.update(userId, data);
  },

  /**
   * List all users — ADMIN only.
   * Caller's role is checked by middleware, but we verify here too.
   */
  async getAllUsers(
    requestingUserId: string,
    filters?: { search?: string; skip?: number; take?: number },
  ) {
    const requester = await userRepository.findById(requestingUserId);
    if (!requester || !can(requester.role, "user:list")) {
      throw new ForbiddenError("Not authorized to list users");
    }

    const result = await userRepository.findAll(filters);
    const { users, total } = result;

    // Calculate pagination metadata
    const skip = filters?.skip ?? 0;
    const take = filters?.take ?? total;
    const page = Math.floor(skip / take) + 1;
    const pageCount = Math.ceil(total / take);

    return {
      users,
      pagination: {
        total,
        page,
        pageCount,
        take,
        skip,
      },
    };
  },

  /**
   * Get a single user by ID — ADMIN only.
   */
  async getUserById(requestingUserId: string, targetId: string) {
    const requester = await userRepository.findById(requestingUserId);
    if (!requester || !can(requester.role, "user:view")) {
      throw new ForbiddenError("Not authorized to view users");
    }

    const user = await userRepository.findById(targetId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  /**
   * Change a user's role — ADMIN only.
   * Prevents demoting the last admin.
   */
  async changeRole(requestingUserId: string, targetId: string, newRole: Role) {
    const requester = await userRepository.findById(requestingUserId);
    if (!requester || !can(requester.role, "user:manage")) {
      throw new ForbiddenError("Not authorized to change roles");
    }

    const target = await userRepository.findById(targetId);
    if (!target) {
      throw new NotFoundError("User not found");
    }

    // Prevent demoting the last admin
    if (target.role === Role.ADMIN && newRole !== Role.ADMIN) {
      const adminCount = await userRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ConflictError(
          "Cannot demote the last admin user. Promote another user first.",
        );
      }
    }

    return userRepository.updateRole(targetId, newRole);
  },

  /**
   * Update a user's profile, role and/or status — ADMIN only.
   * Consolidates profile update, role change and status toggle into a single RESTful endpoint.
   */
  async updateUser(
    requestingUserId: string,
    targetId: string,
    data: { name?: string; email?: string; role?: Role; status?: UserStatus },
  ) {
    const requester = await userRepository.findById(requestingUserId);
    if (!requester || !can(requester.role, "user:manage")) {
      throw new ForbiddenError("Not authorized to manage users");
    }

    const target = await userRepository.findById(targetId);
    if (!target) {
      throw new NotFoundError("User not found");
    }

    const updates: { name?: string; email?: string; role?: Role; status?: UserStatus } = {};

    // Handle name change
    if (data.name !== undefined) {
      updates.name = data.name;
    }

    // Handle email change
    if (data.email !== undefined) {
      validateEmail(data.email);

      // Ensure email is not already taken by another user
      const existing = await userRepository.findByEmail(data.email);
      if (existing && existing.id !== targetId) {
        throw new ConflictError("Email already in use");
      }
      updates.email = data.email;
    }

    // Handle role change
    if (data.role !== undefined) {
      // Prevent demoting the last admin
      if (target.role === Role.ADMIN && data.role !== Role.ADMIN) {
        const adminCount = await userRepository.countByRole(Role.ADMIN);
        if (adminCount <= 1) {
          throw new ConflictError(
            "Cannot demote the last admin user. Promote another user first.",
          );
        }
      }
      updates.role = data.role;
    }

    // Handle status change
    if (data.status !== undefined) {
      updates.status = data.status;
    }

    if (Object.keys(updates).length === 0) {
      return target;
    }

    return userRepository.update(targetId, updates);
  },

  /**
   * Delete a user — ADMIN only.
   * Prevents deleting the last admin.
   */
  async deleteUser(requestingUserId: string, targetId: string) {
    const requester = await userRepository.findById(requestingUserId);
    if (!requester || !can(requester.role, "user:manage")) {
      throw new ForbiddenError("Not authorized to manage users");
    }

    const target = await userRepository.findById(targetId);
    if (!target) {
      throw new NotFoundError("User not found");
    }

    // Prevent deleting the last admin
    if (target.role === Role.ADMIN) {
      const adminCount = await userRepository.countByRole(Role.ADMIN);
      if (adminCount <= 1) {
        throw new ConflictError(
          "Cannot delete the last admin user. Promote another user first.",
        );
      }
    }

    return userRepository.deleteById(targetId);
  },
};
