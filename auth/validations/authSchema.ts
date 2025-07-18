import { z } from "zod";

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export const emailSchema = z
  .email("Invalid email format")
  .min(1, "Email is required");

export const nameSchema = z
  .string()
  .min(1, "This field is required")
  .max(50, "Must not exceed 50 characters");

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Password confirmation is required"),
    firstName: nameSchema,
    lastName: nameSchema,
  })
  .refine(
    (data) => {
      return data.password === data.confirmPassword;
    },
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
