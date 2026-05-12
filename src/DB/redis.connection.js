import { createClient } from "redis";
import { redis_host } from "../../config/config.service.js";

export const redisClient = createClient({
    url: redis_host
});

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log("Connected to Redis");
    }
    catch (error) {
        console.error("Error connecting to Redis:", error);
    }
};