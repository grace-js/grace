import {Value} from "@sinclair/typebox/value";
import {AnyRoute, APIError, convertStatusCode, PossibleResponses, Route} from "./types";
import {globSync} from "glob";
import {FrameworkPlugin} from "./types/plugin";
import {Server} from "bun";
import {Trie} from "route-trie";
import {join} from "path/posix";

export type BeforeRequest = (request: Request) => Promise<{
    headers?: Record<string, string>
} | void>;

export type AfterRequest = (request: Request, response: any) => Promise<void>;

export type ErrorRequest = (request: Request, error: APIError) => Promise<PossibleResponses<any> | void>;

export class Grace {
    public routes: AnyRoute[] = [];
    public before: BeforeRequest[] = [];
    public after: AfterRequest[] = [];
    public error: ErrorRequest[] = [];
    private trie = new Trie();

    public registerPlugin(plugin: FrameworkPlugin): Grace {
        plugin(this);

        return this;
    }

    public registerBefore(handler: BeforeRequest): Grace {
        this.before.push(handler);

        return this;
    }

    public registerAfter(handler: AfterRequest): Grace {
        this.after.push(handler);

        return this;
    }

    public registerError(handler: ErrorRequest): Grace {
        this.error.push(handler);

        return this;
    }

    public registerRoute(route: AnyRoute): Grace {
        this.routes.push(route);

        if (!route.method) {
            throw new Error('Route method is required');
        }

        if (!route.path) {
            throw new Error('Route path is required');
        }

        const path = route.path.replace(/\/+/g, '/');

        this.trie.define(path).handle(route.method, route);

        return this;
    }

    public registerRoutes(path: string): Grace {
        for (const pathname of globSync(path)) {
            const route = require(pathname);

            if (route.default && route.default.handler) {
                if (!route.default.path || !route.default.method) {
                    const extension = pathname.split('.').pop();
                    const split = pathname.split('.')[0].split('/');
                    const method = split.pop()?.toUpperCase();
                    let name = '';

                    while (split.length > 0) {
                        const part = split.pop();

                        if (!part) {
                            continue;
                        }

                        name += '/' + part;
                    }

                    if (!method || !name) {
                        throw new Error('Invalid route path');
                    }

                    route.default.path = name;
                    route.default.method = method as any;
                }

                this.registerRoute(route.default);
            }
        }

        console.log(`📦 Registered ${this.routes.length} routes.`);

        return this;
    }

    public listen(port: number, callback: () => void | Promise<void>): Grace {
        const framework = this;

        Bun.serve({
            port,
            async fetch(request: Request, server: Server): Promise<Response> {
                const response = await framework.handle(request);

                if (response) {
                    return response;
                }

                return new Response(JSON.stringify({message: 'Not found'}), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        });

        callback();

        console.log(`⚡️API listening on port ${port}`);

        return this;
    }

    public async handle(request: Request): Promise<Response> {
        const response = await this.handleInternally(request);
        const code = convertStatusCode(response.code);
        const body = response.body;
        const headers = response.headers;

        if (body instanceof Blob) {
            return new Response(body, {
                status: code,
                headers
            });
        }

        return new Response(JSON.stringify(body), {
            status: code,
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        });
    }

    private async handleInternally(request: Request): Promise<PossibleResponses<any>> {
        try {
            let headers: any = {};

            for (const handler of this.before) {
                const result = await handler(request);

                if (result?.headers) {
                    headers = {
                        ...headers,
                        ...result.headers
                    }
                }
            }

            const url = new URL(request.url);
            const pathname = url.pathname;
            const matched = this.trie.match(url.pathname);
            const node = matched.node;

            if (!node) {
                throw new APIError(404, {message: 'Not found'});
            }

            const route: Route<any, any, any, any, any, any, any> = node.getHandler(request.method);

            if (!route) {
                throw new APIError(404, {message: 'Not found'});
            }

            const rawParameters = matched.params;
            let parameters: any;

            if (route?.schema?.params) {
                try {
                    parameters = Value.Decode(route?.schema?.params, rawParameters);
                } catch (e) {
                    throw new APIError(400, {message: 'Bad request'});
                }
            }

            let body: any;
            const hasBody = route?.schema?.body != null;

            if (request.headers.get('Content-Type') === 'multipart/form-data') {
                const formData = await request.formData();
                const rawBody: {
                    [key: string]: any
                } = {};

                for (let [key, value] of formData.entries()) {
                    rawBody[key] = value;
                }

                if (hasBody) {
                    try {
                        body = Value.Decode(route?.schema?.body, rawBody);
                    } catch (e) {
                        throw new APIError(400, {message: 'Bad request'});
                    }
                }
            } else {
                let rawBody: any;

                try {
                    rawBody = await request.json();
                } catch (e) {
                }

                if (hasBody) {
                    try {
                        body = Value.Decode(route?.schema?.body, rawBody);
                    } catch (e) {
                        throw new APIError(400, {message: 'Bad request'});
                    }
                }
            }

            const urlSearchParams = new URLSearchParams(url.search);
            const rawQuery = Object.fromEntries(urlSearchParams.entries());
            let query: any;

            if (route?.schema?.query) {
                try {
                    query = Value.Decode(route?.schema?.query, rawQuery);
                } catch (e) {
                    throw new APIError(400, {message: 'Bad request'});
                }
            }

            const rawHeaders = Object.fromEntries(request.headers.entries());
            let ctxHeaders: any;

            if (route?.schema?.headers) {
                try {
                    ctxHeaders = Value.Decode(route?.schema?.headers, rawHeaders);
                } catch (e) {
                    throw new APIError(400, {message: 'Bad request'});
                }
            }

            const context = {
                request,
                params: parameters,
                body,
                query,
                headers: ctxHeaders,
                extras: {}
            }

            try {
                for (const before of route.before ?? []) {
                    await before(context);
                }

                const response = await route.handler(context);

                if (response.headers) {
                    headers = {
                        ...headers,
                        ...response.headers
                    }
                }

                for (const after of route.after ?? []) {
                    await after(context, response);
                }

                for (const handler of this.after) {
                    await handler(request, response);
                }

                return {
                    ...response,
                    headers
                };
            } catch (error) {
                throw new APIError(500, {message: 'Internal server error'}, error);
            }
        } catch (error) {
            if (error instanceof APIError) {
                return await this.handleError(request, error);
            }

            return await this.handleError(request, new APIError(500, {message: 'Internal server error'}, error));
        }
    }

    private async handleError(request: Request, error: APIError): Promise<PossibleResponses<any>> {
        for (const handler of this.error) {
            const result = await handler(request, error);

            if (result) {
                return result;
            }
        }

        return {
            code: (error.code as any) ?? 500,
            body: {
                message: error.message ?? 'Internal server error',
            }
        };
    }
}

export function createGrace(): Grace {
    const framework = new Grace();

    framework.registerRoutes(join(__dirname, 'routes/**/*.{js,ts,jsx,tsx}'));

    return framework;
}