import {AnyRoute} from "../routes/route.js";

export interface Router {
    addRoute(route: AnyRoute): void;
    match(path: string, method: string): RouteMatch | null;
}

export interface RouteMatch {
    route: AnyRoute;
    params: Record<string, string>;
}
