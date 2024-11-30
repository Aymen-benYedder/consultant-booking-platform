const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const redisClient = redis.createClient({
    url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    password: process.env.REDIS_PASSWORD || undefined
});

// Handle Redis connection events
redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connect to Redis
redisClient.connect().catch(console.error);

// Cache durations in seconds
const CACHE_DURATIONS = {
    CONSULTANTS: 300,  // 5 minutes
    SERVICES: 600,     // 10 minutes
    USER_DATA: 120,    // 2 minutes
    DEFAULT: 300       // 5 minutes
};

/**
 * Cache middleware factory
 * @param {string} type - Cache type (CONSULTANTS, SERVICES, etc.)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (type = 'DEFAULT') => async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
        return next();
    }

    const cacheKey = `${req.originalUrl}`;

    try {
        // Try to get cached data
        const cachedData = await redisClient.get(cacheKey);
        
        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(JSON.parse(cachedData));
        }

        // If no cache, store original res.json
        const originalJson = res.json.bind(res);

        // Override res.json method
        res.json = async function(data) {
            // Cache the data before sending
            const duration = CACHE_DURATIONS[type] || CACHE_DURATIONS.DEFAULT;
            await redisClient.setEx(cacheKey, duration, JSON.stringify(data));
            console.log(`Cached ${cacheKey} for ${duration} seconds`);

            // Call original res.json with data
            return originalJson(data);
        };

        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
};

/**
 * Clear cache by pattern
 * @param {string} pattern - Cache key pattern to clear
 * @returns {Promise<boolean>} Success status
 */
const clearCache = async (pattern) => {
    try {
        const keys = await redisClient.keys(pattern || '*');
        if (keys.length > 0) {
            await redisClient.del(keys);
            console.log(`Cleared cache for pattern: ${pattern}`);
        }
        return true;
    } catch (error) {
        console.error('Cache clearing error:', error);
        return false;
    }
};

/**
 * Clear all cache
 * @returns {Promise<boolean>} Success status
 */
const clearAllCache = async () => {
    try {
        await redisClient.flushAll();
        console.log('Cleared all cache');
        return true;
    } catch (error) {
        console.error('Cache clearing error:', error);
        return false;
    }
};

/**
 * Get cache stats
 * @returns {Promise<Object>} Cache statistics
 */
const getCacheStats = async () => {
    try {
        const info = await redisClient.info();
        return {
            keyspace: info.keyspace,
            memory: info.memory,
            stats: info.stats
        };
    } catch (error) {
        console.error('Error getting cache stats:', error);
        return null;
    }
};

module.exports = {
    redisClient,
    cacheMiddleware,
    clearCache,
    clearAllCache,
    getCacheStats,
    CACHE_DURATIONS
};
