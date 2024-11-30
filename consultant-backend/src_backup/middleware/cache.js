const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retry_strategy: function(options) {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            // End reconnecting on a specific error and flush all commands with an error
            return new Error('The server refused the connection');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands with an error
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    }
});

// Promisify Redis commands
const getAsync = promisify(redisClient.get).bind(redisClient);
const setexAsync = promisify(redisClient.setex).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);

// Cache durations
const CACHE_DURATIONS = {
    CONSULTANTS: 60 * 5, // 5 minutes
    SERVICES: 60 * 10,   // 10 minutes
    USER_DATA: 60 * 2,   // 2 minutes
    DEFAULT: 60 * 5      // 5 minutes default
};

// Redis error handling
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

// Cache middleware
const cacheMiddleware = (type = 'DEFAULT') => async (req, res, next) => {
    if (req.method !== 'GET') {
        return next();
    }

    try {
        const cacheKey = `${req.originalUrl}`;
        const cachedData = await getAsync(cacheKey);

        if (cachedData) {
            console.log(`Cache hit for ${cacheKey}`);
            return res.json(JSON.parse(cachedData));
        }

        // Store original send
        const originalSend = res.json;

        // Override res.json method
        res.json = function (data) {
            // Reset json to original
            res.json = originalSend;

            // Cache the data
            const duration = CACHE_DURATIONS[type] || CACHE_DURATIONS.DEFAULT;
            setexAsync(cacheKey, duration, JSON.stringify(data))
                .catch(err => console.error('Redis cache error:', err));

            // Send the response
            return originalSend.call(this, data);
        };

        next();
    } catch (error) {
        console.error('Cache middleware error:', error);
        next();
    }
};

// Cache clear utility
const clearCache = async (pattern) => {
    return new Promise((resolve, reject) => {
        const stream = redisClient.scanStream({
            match: pattern || '*',
            count: 100
        });

        const keys = [];

        stream.on('data', (resultKeys) => {
            keys.push(...resultKeys);
        });

        stream.on('end', async () => {
            if (keys.length > 0) {
                try {
                    await Promise.all(keys.map(key => delAsync(key)));
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            } else {
                resolve(true);
            }
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};

module.exports = {
    cacheMiddleware,
    clearCache,
    CACHE_DURATIONS,
    redisClient
};
