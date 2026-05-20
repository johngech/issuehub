import { Role, UserStatus } from "@issue-tracker/core/constants";
import { updateProfileSchema } from "@issue-tracker/core/validation";
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
      const { search, page, pageSize } = req.query;

      // Parse and validate page parameter
      let parsedPage = 1;
      if (page) {
        parsedPage = Number.parseInt(String(page), 10);
        if (Number.isNaN(parsedPage) || parsedPage < 1) {
          return res.status(400).json({
            error: "Validation Error",
            messages: "page must be a positive number",
          });
        }
      }

      // Parse and validate pageSize parameter
      let parsedPageSize = 10;
      if (pageSize) {
        parsedPageSize = Number.parseInt(String(pageSize), 10);
        if (
          Number.isNaN(parsedPageSize) ||
          parsedPageSize <= 0 ||
          parsedPageSize > 100
        ) {
          return res.status(400).json({
            error: "Validation Error",
            messages: "pageSize must be a number between 1 and 100",
          });
        }
      }

      const result = await userService.getPaginatedUsers(req.user.id, {
        search: search as string | undefined,
        page: parsedPage,
        pageSize: parsedPageSize,
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
      if (status === UserStatus.DISABLED && req.params.id === req.user.id) {
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
