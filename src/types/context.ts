export type Context<Body = any, Query = Record<string, string>, Params = Record<string, string>, Headers = Record<string, string>, Extras = Record<string, unknown>> = {
    request: Request;
    body: Body;
    query: Query;
    params: Params;
    headers: Headers;
    extras: Extras;
} & Extras;
