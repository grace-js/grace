import {Static, TSchema} from "@sinclair/typebox";
import {AnyResponseSchema, PossibleResponses} from "./response";
import {Context} from "./context";
import {AfterRoute, BeforeRoute, ContextExtra} from "./middleware";

export type Route<
    Body extends TSchema,
    Query extends TSchema,
    Params extends TSchema,
    Response extends AnyResponseSchema,
    Before extends Array<BeforeRoute<Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>>>,
    After extends Array<AfterRoute<Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>>>,
    Headers extends TSchema | Record<string, string> = Record<string, string>,
    ContextExtras = ContextExtra,
    ContextSchema = Context<Static<Body>, Static<Query>, Static<Params>, Headers extends TSchema ? Static<Headers> : Headers, ContextExtras>
> = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    path?: string;
    schema?: {
        body?: Body;
        query?: Query;
        params?: Params;
        headers?: Headers;
        response?: Response;
    },
    before?: Before,
    after?: After,
    handler: (context: ContextSchema) => Promise<PossibleResponses<Response>>
}

export type AnyRoute = Route<any, any, any, any, any, any, any, any, any>;

export type InferContext<R extends Route<TSchema, TSchema, TSchema, AnyResponseSchema, any, any>> = R extends Route<any, any, any, any, any, any, any, any, infer ContextSchema> ? ContextSchema : never;
export type InferResponse<R extends Route<TSchema, TSchema, TSchema, AnyResponseSchema, any, any>> = R extends Route<any, any, any, infer Response, any, any, any, any, any> ? Response : never;

export function createRoute<
    Body extends TSchema,
    Query extends TSchema,
    Params extends TSchema,
    Headers extends TSchema | Record<string, string>,
    Response extends AnyResponseSchema,
    ContextExtras extends ContextExtra,
    Before extends Array<BeforeRoute<Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>>>,
    After extends Array<AfterRoute<Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>>>,
>(route: Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras>): Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras> {
    return route;
}

export function createRouteWithExtras<ContextExtras extends ContextExtra>() {
    return <
        Body extends TSchema,
        Query extends TSchema,
        Params extends TSchema,
        Headers extends TSchema | Record<string, string>,
        Response extends AnyResponseSchema,
        Before extends Array<BeforeRoute<Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>>>,
        After extends Array<AfterRoute<Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>>>,
    >(route: Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras>)
        : Route<Body, Query, Params, Response, Before, After, Headers, ContextExtras> => {
        return route;
    }
}
