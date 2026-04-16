import z from "zod";
import { objectIdSchema } from "./testRequest";
import { prismaEnumToZod } from "./prismaEnum";
import { PaymentStatus } from "@prisma/client";

export const createPaymentSchema = z.object({
    testIds: z.array(objectIdSchema)
})

export const updatePaymentState = z.object({
    status: prismaEnumToZod(PaymentStatus, "Invalid status value")
})
