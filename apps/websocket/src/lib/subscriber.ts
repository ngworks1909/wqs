import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

export const subscriber = new Redis(process.env.PUB_SUB_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
