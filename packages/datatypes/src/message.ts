export const MessageType = {
  connection: "connection",
  disconnect: "disconnect",
  connect_error: "connect_error",
  update_data: "update_data",
  update_request_count: "update_request_count",
  update_payment_success: "update_payment_success",
  update_payment_failure: "update_payment_failure",
  user_signup: "user_signup",
  socket_message: "socket_message",
  action: "action",
  data: "data",
  connect: "connect",
  error: "error",
  admin_room: "admin_room"
} as const;

export type MessageAction = typeof MessageType[keyof typeof MessageType];