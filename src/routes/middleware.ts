import {AnyRoute, InferContext, Route as RouteSchema} from "./route.js";
import {RateLimitOptions} from "../plugins/rate-limit.js";

export type ContextExtra = any;
export type BeforeRoute<Route extends AnyRoute> = (context: InferContext<Route>) => Promise<any | void>;
export type AfterRoute<Route extends AnyRoute> = (context: InferContext<Route>, response: any) => Promise<void>;

export function createBeforeRoute<ContextExtras extends ContextExtra = {}>() {
    return <
        Route extends RouteSchema<any, any, any, any, any, any, Record<string, string>, ContextExtras>,
    >(handler: BeforeRoute<Route>): BeforeRoute<Route> => {
        return handler;
    }
}

export function createAfterRoute<ContextExtras extends ContextExtra = {}>() {
    return <
        Route extends RouteSchema<any, any, any, any, any, any, Record<string, string>, ContextExtras>,
    >(handler: AfterRoute<Route>): AfterRoute<Route> => {
        return handler;
    }
}

export function rateLimitRoute({
                                   windowMs,
                                   max,
                                   message,
                                   statusCode
                               }: RateLimitOptions): BeforeRoute<AnyRoute> {
    const requests = new Map<string, number[]>();

    return async ({
                      request,
                      app
                  }) => {
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
            return {
                code: statusCode ?? 429,
                body: {
                    message: message ?? 'Too many requests'
                }
            };
        }

        timestamps.push(now);
    };
}
