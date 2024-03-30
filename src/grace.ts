import {APIError} from "./errors/error.js";
import {AnyResponseSchema, convertStatusCode, PossibleResponses} from "./routes/response.js";
import {AnyRoute, Context} from "./routes/route.js";
import {Router} from "./routers/router.js";
import {GracePlugin} from "./plugins/plugin.js";
import {globSync} from "glob";
import {getPath, getQuery} from "./utils/url.js";
import {ZodError} from "zod";
import fastQueryString from "fast-querystring";
import {TrieRouter} from "./routers/trie.js";
import {Adapter} from "./runtime/adapter.js";
import {NodeAdapter} from "./runtime/node/adapter.js";
import {graceToOpenAPISpec} from "./utils/openapi.js";
import * as fs from "node:fs";

export type BeforeRequest = (request: Request) => Promise<{
    headers?: Record<string, string>;
} | PossibleResponses<AnyResponseSchema> | void>;

export type AfterRequest = (request: Request, response: PossibleResponses<AnyResponseSchema>) => Promise<void>;

export type ErrorRequest = (request: Request, error: APIError) => Promise<PossibleResponses<AnyResponseSchema> | void>;

export class Grace {
    public routes: AnyRoute[] = [];
    public before: BeforeRequest[] = [];
    public after: AfterRequest[] = [];
    public error: ErrorRequest[] = [];
    private readonly router: Router;
    public readonly adapter: Adapter;
    public readonly verbose: boolean;

    constructor(router: Router, adapter: Adapter, verbose: boolean = false) {
        this.router = router;
        this.adapter = adapter;
        this.verbose = verbose;
    }

    public registerPlugin(plugin: GracePlugin): Grace {
        plugin(this);
        return this;
    }

    public registerBefore(before: BeforeRequest): Grace {
        this.before.push(before);
        return this;
    }

    public registerAfter(after: AfterRequest): Grace {
        this.after.push(after);
        return this;
    }

    public registerError(error: ErrorRequest): Grace {
        this.error.push(error);
        return this;
    }

    public registerRoute(route: AnyRoute): Grace {
        this.router.addRoute(route);
        this.routes.push(route);

        return this;
    }

    public registerRoutes(path: string): Grace {
        this.registerRoutesAsync(path); // workaround

        return this;
    }

    public exportOpenAPI(path: string): Grace {
        const openapi = graceToOpenAPISpec(this);

        fs.writeFileSync(path, JSON.stringify(openapi, null, 2));

        return this;
    }

    public async fetch(request: Request): Promise<Response> {
        const response = await this.handleInternally(request);

        if (!response) {
            throw new Error('No response was returned');
        }

        if (convertStatusCode(response.code) === 204) {
            return new Response(undefined, {
                status: convertStatusCode(response.code),
                headers: response.headers
            });
        }

        if (typeof response.body === 'object') {
            if ((response.body as any) instanceof Blob) {
                return new Response(response.body, {
                    status: convertStatusCode(response.code),
                    headers: response.headers
                });
            }

            return new Response(JSON.stringify(response.body), {
                status: convertStatusCode(response.code),
                headers: {
                    'Content-Type': 'application/json',
                    ...response.headers
                }
            });
        }

        return new Response(response.body, {
            status: convertStatusCode(response.code),
            headers: {
                'Content-Type': 'text/plain',
                ...response.headers
            }
        });
    }

    public listen(port: number): void {
        this.adapter.listen(this, port);
    }

    public close(): void {
        this.adapter.close();
    }

    public async handleInternally(request: Request): Promise<PossibleResponses<AnyResponseSchema>> {
        try {
            let headers: Record<string, string> = {};
            let beforeResponse = null;

            for (const handler of this.before) {
                const result = await handler(request);

                if (result?.headers) {
                    headers = {
                        ...headers,
                        ...result.headers
                    }
                }

                if (typeof result === 'object' && 'code' in result) {
                    beforeResponse = result;
                }
            }

            if (beforeResponse) {
                beforeResponse.headers = {
                    ...beforeResponse.headers,
                    ...headers
                };

                for (const handler of this.after) {
                    await handler(request, beforeResponse);
                }

                return beforeResponse;
            }

            const pathname = getPath(request.url);
            const matched = this.router.match(pathname, request.method);

            if (!matched) {
                throw new APIError(404, {message: 'Not Found'});
            }

            const route = matched.route;
            const rawParameters = matched.params;
            let parameters: any = rawParameters;

            if (route.schema?.params) {
                try {
                    parameters = await route.schema.params.parseAsync(rawParameters);
                } catch (e: unknown) {
                    if (e instanceof ZodError) {
                        throw new APIError(400, {message: 'Bad Request: ' + e.message}, e);
                    } else {
                        throw new APIError(500, {message: 'Internal Server Error'}, e);
                    }
                }
            }

            let body: any;
            const hasBody = route.schema?.body != null;

            if (request.method !== 'GET') {
                if (request.headers.get('content-type')?.includes('multipart/form-data')) {
                    const formData = await request.clone().formData();
                    const rawBody: Record<string, any> = {};

                    formData.forEach((value, key) => {
                        rawBody[key] = value;
                    });

                    if (hasBody) {
                        try {
                            body = await route.schema!.body!.parseAsync(rawBody);
                        } catch (e: unknown) {
                            if (e instanceof ZodError) {
                                throw new APIError(400, {message: 'Bad Request: ' + e.message}, e);
                            } else {
                                throw new APIError(500, {message: 'Internal Server Error'}, e);
                            }
                        }
                    } else {
                        body = rawBody;
                    }
                } else {
                    let rawBody: any = null;

                    try {
                        rawBody = await request.clone().json();
                    } catch (e) {
                        if (request.headers.get('content-type')?.includes('application/json')) {
                            throw new APIError(400, {message: 'Bad Request: Request body is not JSON:\n' + await request.clone().text()}, e);
                        }
                    }

                    console.log('Raw Body', rawBody);

                    if (hasBody) {
                        try {
                            body = await route.schema!.body!.parseAsync(rawBody);
                            console.log('Body', body);
                        } catch (e: unknown) {
                            if (e instanceof ZodError) {
                                throw new APIError(400, {message: 'Bad Request: ' + e.message}, e);
                            } else {
                                throw new APIError(500, {message: 'Internal Server Error'}, e);
                            }
                        }
                    } else {
                        body = rawBody;
                    }
                }
            }

            const rawQuery: Record<string, any> = fastQueryString.parse(getQuery(request.url));
            let query: any = rawQuery;

            if (route.schema?.query) {
                try {
                    query = await route.schema.query.parseAsync(rawQuery);
                } catch (e: unknown) {
                    if (e instanceof ZodError) {
                        throw new APIError(400, {message: 'Bad Request: ' + e.message}, e);
                    } else {
                        throw new APIError(500, {message: 'Internal Server Error'}, e);
                    }
                }
            }

            const rawHeaders: any = {};
            request.headers.forEach((value: string, key: string) => {
                rawHeaders[key] = value;
            });

            let ctxHeaders: any = rawHeaders;

            if (route.schema?.headers) {
                try {
                    ctxHeaders = await route.schema.headers.parseAsync(rawHeaders);
                } catch (e: unknown) {
                    if (e instanceof ZodError) {
                        throw new APIError(400, {message: 'Bad Request: ' + e.message}, e);
                    } else {
                        throw new APIError(500, {message: 'Internal Server Error'}, e);
                    }
                }
            }

            const context: Context = {
                request,
                body,
                query,
                params: parameters,
                headers: ctxHeaders,
                extras: {}
            };

            try {
                let response;

                for (const before of route.before ?? []) {
                    if (!response) {
                        response = await before(context);
                    }
                }

                if (!response) {
                    response = await route.handler(context);
                }

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

                response.headers = {
                    ...response.headers,
                    ...headers
                };

                return response;
            } catch (e) {
                throw new APIError(500, {message: 'Internal Server Error'}, e);
            }
        } catch (e) {
            if (e instanceof APIError) {
                return await this.handleError(request, e);
            }

            return await this.handleError(request, new APIError(500, {message: 'Internal Server Error'}, e));
        }
    }

    private async handleError(request: Request, error: APIError): Promise<PossibleResponses<AnyResponseSchema>> {
        if (this.error.length < 1) {
            console.error('There was an error while handling a request, but no error handlers were registered!');
            console.error(error.error ?? error);
        }

        for (const handler of this.error) {
            const response = await handler(request, error);

            if (response) {
                return response;
            }
        }

        return {
            code: (error.code ?? 500),
            body: {
                message: error.message ?? 'Internal Server Error'
            }
        } as PossibleResponses<AnyResponseSchema>;
    }

    private async registerRoutesAsync(path: string) {
        const pathWithoutGlob = path.replace(/\*\.?\w*\*?/g, '').replace('//', '/');

        for (const pathname of globSync(path)) {
            if (!pathname.endsWith('.js') && !pathname.endsWith('.ts')) {
                continue;
            }

            const route = await import(pathname);

            if (route.default && route.default.handler) {
                if (!route.default.path || !route.default.method) {
                    const split = pathname.replace(pathWithoutGlob, '').split('.')[0].split('/');

                    const method = split.pop()?.toUpperCase();
                    const remaining = split.reverse();
                    let name = '/';

                    while (split.length > 0) {
                        const part = remaining.pop();

                        if (!part) {
                            continue;
                        }

                        if (name === '/') {
                            name += part;
                            continue;
                        }

                        name += '/' + part;
                    }

                    if (!method || !name) {
                        throw new Error('Invalid route path' + pathname.replace(pathWithoutGlob, ''));
                    }

                    route.default.path = name;
                    route.default.method = method as any;
                }

                this.registerRoute(route.default);
            }
        }
    }

}

export function createGrace({
                                router = new TrieRouter(),
                                adapter = new NodeAdapter(),
                                verbose = false
                            }: {
    router?: Router;
    adapter?: Adapter;
    verbose?: boolean;
} = {
    router: new TrieRouter(),
    adapter: new NodeAdapter(),
    verbose: false
}) {
    return new Grace(router, adapter, verbose);
}
