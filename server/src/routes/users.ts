import { Role, UserStatus } from "@issue-tracker/core/constants";
import { updateProfileSchema } from "@issue-tracker/core/validation";
import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/authorize";
import { userService } from "../services/user.service";
import { userRepository } from "../repositories/user.repository";

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

      // Parse and validate skip parameter
      let parsedSkip: number | undefined;
      if (skip) {
        parsedSkip = Number.parseInt(String(skip), 10);
        if (Number.isNaN(parsedSkip) || parsedSkip < 0) {
          return res.status(400).json({
            error: "Validation Error",
            messages: "skip must be a non-negative number",
          });
        }
      }

      // Parse and validate take parameter
      let parsedTake: number | undefined;
      if (take) {
        parsedTake = Number.parseInt(String(take), 10);
        if (Number.isNaN(parsedTake) || parsedTake <= 0 || parsedTake > 100) {
          return res.status(400).json({
            error: "Validation Error",
            messages: "take must be a number between 1 and 100",
          });
        }
      }

      const result = await userService.getAllUsers(req.user.id, {
        search: search as string | undefined,
        skip: parsedSkip,
        take: parsedTake,
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

/** PATCH /api/users/:id — Update user profile, role and/or status */
router.patch(
  "/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  async (req, res, next) => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation Error",
          messages: parsed.error.message,
        });
      }

      const { name, email, role, status } = parsed.data;

      // Prevent self-disable
      if (
        status === UserStatus.DISABLED &&
        req.params.id === req.user.id
      ) {
        return res.status(400).json({
          error: "Validation Error",
          messages: "Cannot disable your own account",
        });
      }

      const user = await userService.updateUser(
        req.user.id,
        req.params.id as string,
        { name, email, role, status },
      );
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
);

/** DELETE /api/users/:id — Delete user account */
router.delete(
  "/users/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  async (req, res, next) => {
    try {
      await userService.deleteUser(req.user.id, req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);

export { router as usersRouter };
