import {GracePlugin} from "./plugin.js";

export const logger = (prefix: string = '⚡'): GracePlugin => (app) => {
    return app
        .registerBefore(async (request) => {
            (request as any).logger = {
                timestamp: Date.now()
            }
        })
        .registerAfter(async (request, response) => {
            const url = new URL(request.url);

            console.log(`${prefix} ${request.method} - ${url.pathname} - ${response?.code} - ${Date.now() - (request as any).logger.timestamp}ms`);
        })
        .registerError(async (request, error) => {
            const url = new URL(request.url);

            console.error(`${prefix} ${request.method} - ${url.pathname} - ${error.code ?? 500} - ${Date.now() - (request as any).logger.timestamp}ms - ${error.message}`);
        });
}
