
import z from "zod";
import { TestRequestStatus } from "@prisma/client";
const mobileSchema = z.string().regex(
    /^[6-9]\d{9}$/,
    "Not a valid mobile number"
);

export const objectIdSchema = z.string().regex(
  /^[0-9a-fA-F]{24}$/,
  "Invalid water type"
);

function getTypeOnMessage(message: string){
    return z.string().min(3, message);
}

export const createTestRequestSchema = z.object({
    waterTypeId: objectIdSchema,
    location: getTypeOnMessage("Location must be at least 3 characters long"),
    sampleLocation: getTypeOnMessage("Sample location must be at least 3 characters long"),
    mobileNumber: mobileSchema
})

export const updateTestRequestSchema = createTestRequestSchema;

export const testRequestStatusUpdateSchema = z.object({
    status: z.enum([TestRequestStatus.Accepted, TestRequestStatus.Rejected, TestRequestStatus.SampleCollected])
})