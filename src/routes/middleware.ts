import {AnyRoute, InferContext, Route as RouteSchema} from "./route.js";

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
