// src/features/auth/authValidation.js

import { z } from "zod";

// Skema untuk Login
export const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Skema untuk Register
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "Full Name must be at least 3 characters" })
      .max(100, { message: "Full Name must not exceed 100 characters" })
      .regex(/^[a-zA-Z\s]+$/, { message: "Full Name can only contain letters and spaces" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" })
      .max(50, { message: "Username must not exceed 50 characters" })
      .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
    email: z.string().email({ message: "Invalid email address" }),
    phoneNumber: z
      .string()
      .min(10, { message: "Phone number must be at least 10 digits" })
      .max(15, { message: "Phone number must not exceed 15 digits" })
      .regex(/^[0-9]+$/, { message: "Phone number can only contain numbers" })
      .refine((val) => val.startsWith('08'), {
        message: "Phone number must start with '08' for Indonesian numbers"
      }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password must not exceed 100 characters" })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, {
        message: "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm Password must be at least 8 characters" }),
    agreed: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms & Conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // Menentukan field mana yang akan menampilkan error ini
  });

// Skema untuk Forgot Password
export const forgotPasswordSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
});

// Skema untuk Reset Password
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const changePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "New Password must be at least 8 characters" }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ["password_confirmation"], // Tampilkan error di field konfirmasi
  });
