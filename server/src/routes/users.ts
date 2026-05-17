import { Role } from "@issue-tracker/core/constants";
import {
  changeRoleSchema,
  updateProfileSchema,
} from "@issue-tracker/core/validation";
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";
import { userService } from "../services/user.service";

const router = Router();

// ─── Own profile ───

/** GET /api/me — Current user profile */
router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await userService.getOwnProfile(req.user.id);
    res.json({ user, session: req.session });
  } catch (err) {
    next(err);
  }
});

/** PUT /api/me — Update own profile */
router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    const { error, success, data } = parsed;
    if (!success) {
      return res.status(400).json({
        error: "Validation Error",
        messages: error.message,
      });
    }

    const user = await userService.updateProfile(req.user.id, data);
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// ─── Admin: user management ───

/** GET /api/users — List all users */
router.get(
  "/users",
  requireAuth,
  requireRole(Role.ADMIN),
  async (req, res, next) => {
    try {
      const { search, skip, take } = req.query;
      const result = await userService.getAllUsers(req.user.id, {
        search: search as string | undefined,
        skip: skip ? Number(skip) : undefined,
        take: take ? Number(take) : undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

/** GET /api/users/:id — View single user */
router.get(
  "/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  async (req, res, next) => {
    try {
      const user = await userService.getUserById(
        req.user.id,
        req.params.id as string,
      );
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

/** PATCH /api/users/:id/role — Change user role */
router.patch(
  "/users/:id/role",
  requireAuth,
  requireRole(Role.ADMIN),
  async (req, res, next) => {
    try {
      const parsed = changeRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation Error",
          messages: parsed.error.message,
        });
      }

      const user = await userService.changeRole(
        req.user.id,
        req.params.id as string,
        parsed.data.role,
      );
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

/** PATCH /api/users/:id/disable — Toggle user active/disabled */
router.patch(
  "/users/:id/disable",
  requireAuth,
  requireRole(Role.ADMIN),
  async (req, res, next) => {
    try {
      const user = await userService.toggleUserStatus(
        req.user.id,
        req.params.id as string,
      );
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

export { router as usersRouter };
