import {FrameworkPlugin} from "../types/plugin";
import {convertStatusCode} from "../types";

export const logger = (prefix: string = '⚡'): FrameworkPlugin => {
    return (app) => {
        return app
            .registerBefore(async (request) => {
                (request as any).logger = {
                    timestamp: Date.now()
                }
            })
            .registerAfter(async (request, response) => {
                const code = convertStatusCode(response.code);
                const url = new URL(request.url);

                console.log(`${prefix} ${request.method} - ${url.pathname} - ${code} - ${Date.now() - (request as any).logger.timestamp}ms`);
            });
    }
}
