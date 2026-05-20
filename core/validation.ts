import { z } from "zod";
import { Role, UserStatus } from "./constants";

export const signInSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(8, { error: "Password must be at least 8 characters" }),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    name: z.string().min(2, { error: "Name must be at least 2 characters" }),
    email: z.email({ error: "Invalid email address" }),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters" })
      .max(40, { error: "Password must be a maximum of 40 characters" }),
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["confirmPassword"],
      });
    }
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters" })
    .max(50, { error: "Name must be at most 50 characters" })
    .optional(),
  email: z.email({ error: "Invalid email address" }).optional(),

  role: z
    .enum(Role, {
      error: "Role must be ADMIN, AGENT, or USER",
    })
    .optional(),

  status: z
    .enum(UserStatus, {
      error: "Status must be ACTIVE or INACTIVE",
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
