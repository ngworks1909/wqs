import { z } from "zod";
import { MessageType } from "@repo/datatypes";

const updateRequestCountSchema = z.object({
  action: z.literal(MessageType.update_request_count),
  data: z.object({
    status: z.string(),
    count: z.number()
  })
});

const updatePaymentSuccessSchema = z.object({
  action: z.literal(MessageType.update_payment_success),
  data: z.object({
    amount: z.number()
  })
});

const updatePaymentFailureSchema = z.object({
  action: z.literal(MessageType.update_payment_failure)
});

const userSignupSchema = z.object({
  action: z.literal(MessageType.user_signup),
  data: z.object({
    userId: z.string()
  })
});


export const socketEventSchema = z.discriminatedUnion(MessageType.action, [
  updateRequestCountSchema,
  updatePaymentSuccessSchema,
  updatePaymentFailureSchema,
  userSignupSchema
]);