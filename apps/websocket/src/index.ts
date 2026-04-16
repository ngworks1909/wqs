import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { jwtVerify, importJWK } from "jose";
import { MessageType } from "@repo/datatypes";
import { subscriber } from "./lib/subscriber";
import {z} from 'zod';
import { socketEventSchema } from "./zod/event";
import {Role} from "@prisma/client"

const app = express();
app.use(cors());

const PORT = process.env.PORT ?? 8080;

const server = app.listen(PORT, () => {
  console.log(`Websocket server running on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*", // change in production
  },
});

/**
 * 🔐 Socket Authentication Middleware
 */
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("No token provided"));
    }

    const secret = process.env.JWT_SECRET ?? "secret";

    const jwk = await importJWK({
      k: secret,
      alg: "HS256",
      kty: "oct",
    });

    const { payload } = await jwtVerify(token, jwk);

    // ✅ Check Admin Role
    if (payload.role !== Role.admin) {
      return next(new Error("Admins only"));
    }

    // Attach user data
    socket.data.user = payload;

    next();
  } catch (error) {
    return next(new Error("Invalid or expired token"));
  }
});

io.on(MessageType.connection, (socket) => {
    socket.join(MessageType.admin_room)
  socket.on(MessageType.disconnect, () => {
    socket.leave(MessageType.admin_room);
  });
});

subscriber.on("connect", () => {
    console.log("Subscriber connected to Redis");
})

subscriber.on("error", (err: Error) => {
    console.error("Subscriber error:", err);
})

subscriber.subscribe(MessageType.socket_message, (err: Error | null, count: number) => {
    if(err){
        console.error("Failed to subscribe to channel:", err);
    } else {
        console.log(`Subscribed to ${count} channel(s). Waiting for messages...`);
    }
})

function broadcastSocketEvent(
  event: z.infer<typeof socketEventSchema>
) {

  switch (event.action) {
    case MessageType.update_payment_failure:
      return io.to(MessageType.admin_room)
        .emit(event.action);

    default:
      return io.to(MessageType.admin_room)
        .emit(event.action, event.data);
  }
}


subscriber.on("message", (channel: string, message: string) => {
    if(channel === MessageType.socket_message){
        try {
            const socketEventValidationResponse = socketEventSchema.safeParse(JSON.parse(message));
            if(!socketEventValidationResponse.success){
                console.error("Invalid socket event received:", socketEventValidationResponse.error);
                return;
            }
            const socketEvent = socketEventValidationResponse.data;
            broadcastSocketEvent(socketEvent);
        } catch (error) {
            console.log("Failed to process socket message:", error);
        }
    }
})