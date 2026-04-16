import z from 'zod'

export const usernameSchema = z
  .string().trim()
  .min(3, "Username must be at least 3 characters long")
  .max(30, "Username must be at most 30 characters long");

export const emailSchema = z.email("Invalid email");

export const passwordSchema = z
  .string().trim()
  .min(6, "Password must be at least 6 characters long");


export const validateField = (name: string, value: string): string | null => {
  try {
    if (name === "username") {
      usernameSchema.parse(value);
    } else if (name === "email") {
      emailSchema.parse(value);
    } else if (name === "password") {
      passwordSchema.parse(value);
    }
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message ?? "Invalid input";
    }
    return "Invalid input";
  }
};


export const upsertUserSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

