import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// Initialize Redis Client
const redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined, // Only use password if set
    tls: process.env.REDIS_TLS ? {} : undefined, // Enable TLS only for Redis Cloud
});

// Event listeners
redis.on("connect", () => console.log("✅ Connected to Redis"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));


export const setValue = async (key, value, expire = null) => {
    try {
        if (expire) {
            await redis.set(key, value, "EX", expire);
        } else {
            await redis.set(key, value);
        }
        return true;
    } catch (error) {
        console.error("❌ Redis SET error:", error);
        return false;
    }
};


export const getValue = async (key) => {
    try {
        const value = await redis.get(key);
        return value;
    } catch (error) {
        console.error("❌ Redis GET error:", error);
        return null;
    }
};

export const deleteValue = async (key) => {
    try {
        const result = await redis.del(key);
        return result > 0;
    } catch (error) {
        console.error("❌ Redis DELETE error:", error);
        return false;
    }
};

export default redis;
