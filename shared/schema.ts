import { z } from "zod";

// User schema
export const userSchema = z.object({
  id: z.number(),
  username: z.string().min(1, "Username is required"),
  pinHash: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Password entry schema
export const passwordEntrySchema = z.object({
  id: z.string(),
  serviceName: z.string().min(1, "Service name is required"),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  notes: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const insertPasswordEntrySchema = passwordEntrySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PasswordEntry = z.infer<typeof passwordEntrySchema>;
export type InsertPasswordEntry = z.infer<typeof insertPasswordEntrySchema>;

// Vault schema
export const vaultSchema = z.object({
  encryptedData: z.string(),
  salt: z.string(),
  iv: z.string(),
});

export type Vault = z.infer<typeof vaultSchema>;

// Share link schema
export const shareLinkSchema = z.object({
  id: z.string(),
  passwordId: z.string(),
  expiresAt: z.number(),
  encryptedData: z.string(),
});

export type ShareLink = z.infer<typeof shareLinkSchema>;
