import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

export const postSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200, "Title too long"),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  bio: z.string().max(500, "Bio too long").optional().or(z.literal("")),
  favorite_sport: z.string().optional().or(z.literal("")),
});

export const performanceMetricSchema = z.object({
  sprint_40m_s: z.number().min(3.5, "Too fast!").max(10, "Too slow for an athlete").optional(),
  vo2_max: z.number().min(20, "Critically low").max(95, "World record level!").optional(),
  bench_press_1rm_kg: z.number().min(0).max(350).optional(),
  squat_1rm_kg: z.number().min(0).max(450).optional(),
  illinois_agility_s: z.number().min(10).max(30).optional(),
  vertical_jump_cm: z.number().min(10).max(150).optional(),
  reaction_time: z.number().min(0.05).max(1.0).optional(),
  training_hours_per_week: z.number().min(0).max(100).optional(),
  recorded_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});
