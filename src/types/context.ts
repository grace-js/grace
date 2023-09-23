export type Context<Body = {}, Query = {}, Params = {}, Headers = Record<string, string>, Extras = Record<string, unknown>> = {
    request: Request;
    body: Body;
    query: Query;
    params: Params;
    headers: Headers;
    extras: Extras;
} & Extras;
