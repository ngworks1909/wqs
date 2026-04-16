import z from "zod";
import { objectIdSchema } from "./testRequest";

export const updateTestSchema = z.object({
    tests: z.array(
        z.object({
            id: objectIdSchema,
            value: z.number("Value must be a number")
        })
    )
})