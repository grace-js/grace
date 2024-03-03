import {AnyResponseSchema, PossibleResponses, ResponseSchema} from "./response.js";
import {AfterRoute, BeforeRoute, ContextExtra} from "./middleware.js";
import {ZodSchema} from "zod";

export type Context<Body = any, Query = Record<string, string>, Params = Record<string, string>, Headers = Record<string, string>, Extras = Record<string, unknown>> =
    {
        request: Request;
        body: Body;
        query: Query;
        params: Params;
        headers: Headers;
        extras: Extras;
    }
    & Extras;

export type Route<
    Body,
    Query,
    Params,
    Response extends AnyResponseSchema,
    Before extends Array<BeforeRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
    After extends Array<AfterRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
    Headers = Record<string, string>,
    ContextExtras = ContextExtra,
    ContextSchema = Context<Body, Query, Params, Headers, ContextExtras>
> = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    format?: 'json' | 'multipart' | 'text';
    path?: string;
    schema?: {
        body?: ZodSchema<Body>;
        query?: ZodSchema<Query>;
        params?: ZodSchema<Params>;
        headers?: ZodSchema<Headers>;
        response?: Response;
    },
    before?: Before,
    after?: After,
    handler: (context: ContextSchema) => Promise<PossibleResponses<Response>>
}

export type AnyRoute = Route<any, any, any, any, any, any, any, any, any>;
export type InferContext<R extends AnyRoute> = R extends Route<any, any, any, any, any, any, any, any, infer ContextSchema> ? ContextSchema : never;
export type InferResponse<R extends AnyRoute> = R extends Route<any, any, any, infer Response, any, any, any, any, any> ? Response : never;

export function createRoute<
    Body,
    Query,
    Params,
    Headers,
    Response extends AnyResponseSchema,
    ContextExtras extends ContextExtra,
    Before extends Array<BeforeRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
    After extends Array<AfterRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
>(route: Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras>): Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras> {
    return route;
}

export function createRouteWithExtras<ContextExtras extends ContextExtra>() {
    return <
        Body,
        Query,
        Params,
        Headers,
        Response extends AnyResponseSchema,
        Before extends Array<BeforeRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
        After extends Array<AfterRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
    >(route: Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras>)
        : Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras> => {
        return route;
    }
}

export function createRouteTemplate<ContextExtras extends ContextExtra>({
                                                                            before = [],
                                                                            after = [],
                                                                            schema = {},
                                                                        }: {
    before?: Array<BeforeRoute<Route<any, any, any, any, any, any, any, ContextExtras>>>;
    after?: Array<AfterRoute<Route<any, any, any, any, any, any, any, ContextExtras>>>;
    schema?: {
        body?: ZodSchema;
        query?: ZodSchema;
        params?: ZodSchema;
        headers?: ZodSchema | Record<string, string>;
        response?: AnyResponseSchema;
    };
} = {}) {
    return function <
        Body,
        Query,
        Params,
        Headers,
        Response extends AnyResponseSchema,
        Before extends Array<BeforeRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
        After extends Array<AfterRoute<Route<Body, Query, Params, any, any, any, Headers, ContextExtras>>>,
    >(route: Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras>):
        Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras> {
        return {
            ...route,
            before: [...before, ...route.before as any] as any,
            after: [...after, ...route.after as any] as any,
            schema: {
                ...schema,
                ...route.schema,
            } as any,
        };
    }
}
