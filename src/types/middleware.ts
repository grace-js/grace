import {AnyResponseSchema, PossibleResponses} from "./response";
import {InferContext, InferResponse, Route as RouteSchema} from "./route";
import {TSchema} from "@sinclair/typebox";

export type ContextExtra = any;
export type BeforeRoute<Route extends RouteSchema<TSchema, TSchema, TSchema, AnyResponseSchema, any, any, TSchema | Record<string, string>>> = (context: InferContext<Route>) => Promise<PossibleResponses<InferResponse<Route>> | void>;
export type AfterRoute<Route extends RouteSchema<TSchema, TSchema, TSchema, AnyResponseSchema, any, any, TSchema | Record<string, string>>> = (context: InferContext<Route>, response: any) => Promise<void>;

export function createBeforeRoute<ContextExtras extends ContextExtra = {}>() {
    return <
        Body extends TSchema,
        Query extends TSchema,
        Params extends TSchema,
        Response extends AnyResponseSchema,
        Route extends RouteSchema<Body, Query, Params, Response, any, any, Headers, ContextExtras>,
        Headers extends TSchema | Record<string, string> = Record<string, string>,
    >(handler: BeforeRoute<Route>): BeforeRoute<Route> => {
        return handler;
    }
}

export function createAfterRoute<ContextExtras extends ContextExtra = {}>() {
    return <
        Body extends TSchema,
        Query extends TSchema,
        Params extends TSchema,
        Response extends AnyResponseSchema,
        Route extends RouteSchema<Body, Query, Params, Response, any, any, Headers, ContextExtras>,
        Headers extends TSchema | Record<string, string> = Record<string, string>,
    >(handler: AfterRoute<Route>): AfterRoute<Route> => {
        return handler;
    }
}
