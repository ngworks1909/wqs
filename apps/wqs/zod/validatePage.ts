import z from "zod";

export const validatePageSchema = z.number().min(1, "Page number must be at least 1")