import {GracePlugin} from "./plugin.js";
import {APIError} from "../errors/error.js";

export interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
    statusCode?: number;
}

export const rateLimit = (options: RateLimitOptions): GracePlugin => (app) => {
    const {
        windowMs,
        max,
        message,
        statusCode
    } = options;
    const requests = new Map<string, number[]>();

    return app.registerBefore(async (request) => {
        const ip = app.adapter.getRequestIp(request);

        if (ip == null) {
            console.error('No IP address found in request, rate limiting is not possible');
            return;
        }

        if (!requests.has(ip)) {
            requests.set(ip, []);
        }

        const timestamps = requests.get(ip)!;
        const now = Date.now();

        // Remove timestamps older than the current window
        while (timestamps.length > 0 && now - timestamps[0] > windowMs) {
            timestamps.shift();
        }

        if (timestamps.length >= max) {
            throw new APIError(statusCode ?? 429, {
                message: message ?? 'Too many requests'
            });
        }

        timestamps.push(now);
    });
}
