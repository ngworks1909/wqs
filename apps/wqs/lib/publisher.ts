import Redis from "ioredis";

const redis = new Redis(process.env.PUB_SUB_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});


export async function publish(channel:string, message: string){
    await redis.publish(channel, message);
}