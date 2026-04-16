import { MessageAction, MessageType } from "./message";
import { TestRequestStatus } from "@prisma/client";

interface SocketBaseEvent {
  action: MessageAction;
}

export interface UpdateRequestCountEvent extends SocketBaseEvent {
  action: typeof MessageType.update_request_count;
  data: {
    previousStatus: TestRequestStatus | null;
    status: TestRequestStatus;
    count: number;
  };
}

export interface UpdatePaymentSuccessEvent extends SocketBaseEvent {
  action: typeof MessageType.update_payment_success;
  data: {
    amount: number;
  };
}

export interface UpdatePaymentFailureEvent extends SocketBaseEvent {
  action: typeof MessageType.update_payment_failure;
}

export interface UserSignupEvent extends SocketBaseEvent {
  action: typeof MessageType.user_signup;
}

export type SocketEvent =
  | UpdateRequestCountEvent
  | UpdatePaymentSuccessEvent
  | UpdatePaymentFailureEvent
  | UserSignupEvent;