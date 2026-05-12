import { redisClient } from "../redis.connection";

export const setValue = async (key, value, ttl = null) => {
    try {
        const data  = typeof value === 'object' ? JSON.stringify(value) : value;
        let redisCommand = redisClient.set(key, data);
        if (ttl !== null) {
            redisCommand = redisCommand.expire(key, ttl);
        }
        await redisCommand;
        console.log(`Value set for key: ${key}`);
    } catch (error) {
    console.error(`Error setting value for key ${key}:`, error);
    }
};




export const getValue = async (key) => {
    try {
        const value = await redisClient.get(key);
        if (value === null) {
            console.log(`Key ${key} not found`);
            return null;
        }
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    } catch (error) {
        console.error(`Error getting value for key ${key}:`, error);
        return null;
    }
};