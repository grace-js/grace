import {
  AfterRoute,
  AnyResponseSchema,
  AnyRoute,
  APIError,
  BeforeRoute,
  ContextExtra,
  convertStatusCode,
  PossibleResponses,
  Route,
} from "./types";
import { globSync } from "glob";
import { FrameworkPlugin } from "./types/plugin";
import { Server } from "bun";
import { TSchema } from "@sinclair/typebox";
import { getPath, getQuery } from "./utils/url";
import { Trie } from "route-trie";
import fastQueryString from "fast-querystring";
import { CompileParse } from "./types/typebox";

export type BeforeRequest = (request: Request) => Promise<
  | {
      headers?: Record<string, string>;
    }
  | {
      code: number;
      body: any;
      headers?: Record<string, string>;
    }
  | void
>;

export type AfterRequest = (request: Request, response: any) => Promise<void>;

export type ErrorRequest = (
  request: Request,
  error: APIError,
) => Promise<PossibleResponses<any> | void>;

export class Grace {
  public routes: AnyRoute[] = [];
  public before: BeforeRequest[] = [];
  public after: AfterRequest[] = [];
  public error: ErrorRequest[] = [];
  private router = new Trie();
  private readonly debug: boolean;

  constructor(
    {
      debug = false,
    }: {
      debug: boolean;
    } = { debug: false },
  ) {
    this.debug = debug;
  }

  public registerPlugin(plugin: FrameworkPlugin): Grace {
    plugin(this);

    this.debugLog(`🔌 Registered plugin`);

    return this;
  }

  public registerBefore(handler: BeforeRequest): Grace {
    this.before.push(handler);

    this.debugLog(`🔌 Registered before handler`);

    return this;
  }

  public registerAfter(handler: AfterRequest): Grace {
    this.after.push(handler);

    this.debugLog(`🔌 Registered after handler`);

    return this;
  }

  public registerError(handler: ErrorRequest): Grace {
    this.error.push(handler);

    this.debugLog(`🔌 Registered error handler`);

    return this;
  }

  public registerRoute<
    Body extends TSchema,
    Query extends TSchema,
    Params extends TSchema,
    Headers extends TSchema | Record<string, string>,
    Response extends AnyResponseSchema,
    ContextExtras extends ContextExtra,
    Before extends Array<
      BeforeRoute<
        Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>
      >
    >,
    After extends Array<
      AfterRoute<
        Route<Body, Query, Params, Response, any, any, Headers, ContextExtras>
      >
    >,
  >(
    route: Route<
      Body,
      Query,
      Params,
      Response,
      Before,
      After,
      Headers,
      ContextExtras
    >,
  ): Grace {
    this.routes.push(route);

    if (!route.method) {
      throw new Error("Route method is required");
    }

    if (!route.path) {
      throw new Error("Route path is required");
    }

    const path = route.path.replace(/\/+/g, "/");
    route.compiledSchema = {};

    if (route.schema?.body) {
      route.compiledSchema.body = CompileParse(route.schema.body);
    }

    if (route.schema?.query) {
      route.compiledSchema.query = CompileParse(route.schema.query);
    }

    if (route.schema?.params) {
      route.compiledSchema.params = CompileParse(route.schema.params);
    }

    if (route.schema?.headers) {
      try {
        route.compiledSchema.headers = CompileParse(
          route.schema.headers as TSchema,
        );
      } catch (e) {
        // Not a typebox schema
      }
    }

    this.debugLog(`📦 Registered route ${route.method} ${path}`);

    this.router.define(path).handle(route.method, route);

    return this;
  }

  public registerRoutes(path: string): Grace {
    const pathWithoutGlob = path
      .replace(/\*\.?[\w]*\*?/g, "")
      .replace(/\/+/g, "/");

    this.debugLog("pathWithoutGlob: " + pathWithoutGlob);

    for (const pathname of globSync(path)) {
      const route = require(pathname);

      if (route.default && route.default.handler) {
        if (!route.default.path || !route.default.method) {
          this.debugLog(
            `Registering route without glob ${pathname.replace(
              pathWithoutGlob,
              "",
            )}`,
          );

          const extension = pathname
            .replace(pathWithoutGlob, "")
            .split(".")
            .pop();
          const split = pathname
            .replace(pathWithoutGlob, "")
            .split(".")[0]
            .split("/");

          this.debugLog(`Registering route ${pathname} - ${split}`);

          const method = split.pop()?.toUpperCase();
          const remaining = split.reverse();
          let name = "/";

          while (split.length > 0) {
            const part = remaining.pop();

            if (!part) {
              continue;
            }

            if (name === "/") {
              name += part;
              continue;
            }

            name += "/" + part;
          }

          if (!method || !name) {
            throw new Error(
              "Invalid route path" + pathname.replace(pathWithoutGlob, ""),
            );
          }

          this.debugLog(`Registering route ${pathname} - ${name} ${method}`);

          route.default.path = name;
          route.default.method = method as any;
        }

        this.registerRoute(route.default);
      }
    }

    console.log(`📦 Registered ${this.routes.length} routes.`);

    return this;
  }

  public listen(
    port: number,
    callback: () => void | Promise<void> = () => {},
  ): Grace {
    const framework = this;

    Bun.serve({
      port,
      async fetch(request: Request, server: Server): Promise<Response> {
        const response = await framework.handle(request);

        if (response) {
          return response;
        }

        return new Response(JSON.stringify({ message: "Not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    });

    callback();

    console.log(`⚡️API listening on port ${port}`);

    return this;
  }

  public async handle(request: Request): Promise<Response> {
    const response = await this.handleInternally(request);
    const convertedStatusCode = convertStatusCode(response.code);

    if (convertedStatusCode === 204) {
      return new Response(undefined, {
        status: convertedStatusCode,
        headers: response.headers,
      });
    }

    if (typeof response.body === "object") {
      if (response.body instanceof Blob) {
        const body = await response.body.arrayBuffer();
        return new Response(body, {
          status: convertedStatusCode,
          headers: response.headers,
        });
      }

      return new Response(JSON.stringify(response.body), {
        status: convertedStatusCode,
        headers: {
          "Content-Type": "application/json",
          ...response.headers,
        },
      });
    }

    return new Response(response.body, {
      status: convertedStatusCode,
      headers: {
        "Content-Type": "text/plain",
        ...response.headers,
      },
    });
  }

  public async handleInternally(
    request: Request,
  ): Promise<PossibleResponses<any>> {
    try {
      let headers: Record<string, string> = {};
      let beforeResponse = null;

      for (const handler of this.before) {
        const result = await handler(request);

        if (result?.headers) {
          headers = {
            ...headers,
            ...result.headers,
          };
        }

        if (typeof result === "object" && "code" in result) {
          beforeResponse = result;
        }
      }

      if (beforeResponse) {
        for (const handler of this.after) {
          await handler(request, beforeResponse);
        }

        return beforeResponse as any;
      }

      const pathname = getPath(request.url);
      const matched = this.router.match(pathname);
      const node = matched.node;

      if (!node) {
        throw new APIError(404, { message: "Not found" });
      }

      const route: AnyRoute = node.getHandler(request.method);

      if (!route) {
        throw new APIError(404, { message: "Not found" });
      }

      const rawParameters = matched.params;
      let parameters: any = rawParameters;

      if (route?.compiledSchema?.params) {
        try {
          parameters = route.compiledSchema.params(rawParameters);
        } catch (e) {
          console.error(e);
          throw new APIError(400, { message: "Bad request" });
        }
      }

      let body: any;
      const hasBody = route?.compiledSchema?.body != null;

      if (request.method !== "GET") {
        if (
          request.headers.get("Content-Type")?.includes("multipart/form-data")
        ) {
          const formData = await request.formData();
          const rawBody: {
            [key: string]: any;
          } = {};

          for (let [key, value] of formData.entries()) {
            rawBody[key] = value;
          }

          if (hasBody) {
            try {
              body = route!.compiledSchema!.body!(rawBody);
            } catch (e) {
              throw new APIError(400, { message: "Bad request" }, e);
            }
          } else {
            body = rawBody;
          }
        } else {
          let rawBody: any;

          try {
            rawBody = await request.json();
          } catch (e) {}

          if (hasBody) {
            try {
              body = route!.compiledSchema!.body!(rawBody);
            } catch (e) {
              throw new APIError(400, { message: "Bad request" }, e);
            }
          } else {
            body = rawBody;
          }
        }
      }

      const rawQuery: Record<string, any> = fastQueryString.parse(
        getQuery(request.url),
      );
      let query: any = rawQuery;

      if (route?.compiledSchema?.query) {
        try {
          query = route.compiledSchema.query!(rawQuery);
        } catch (e) {
          throw new APIError(400, { message: "Bad request" }, e);
        }
      }

      const rawHeaders: any = {};
      request.headers.forEach((value, key) => {
        rawHeaders[key] = value;
      });

      let ctxHeaders: any = rawHeaders;

      if (route?.compiledSchema?.headers) {
        try {
          ctxHeaders = route.compiledSchema.headers(rawHeaders);
        } catch (e) {
          console.error(e);
          throw new APIError(400, { message: "Bad request" });
        }
      }

      const context = {
        request,
        params: parameters,
        body,
        query,
        headers: ctxHeaders,
        extras: {},
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
            ...response.headers,
          };
        }

        for (const after of route.after ?? []) {
          await after(context, response);
        }

        for (const handler of this.after) {
          await handler(request, response);
        }

        return {
          ...response,
          headers,
        };
      } catch (error) {
        throw new APIError(500, { message: "Internal server error" }, error);
      }
    } catch (error) {
      if (error instanceof APIError) {
        return await this.handleError(request, error);
      }

      return await this.handleError(
        request,
        new APIError(500, { message: "Internal server error" }, error),
      );
    }
  }

  private async handleError(
    request: Request,
    error: APIError,
  ): Promise<PossibleResponses<any>> {
    if (this.error.length === 0) {
      if (error.code === 500 || typeof error.code !== "number") {
        console.error(
          `There was an error while handling a request: ${
            error.code ?? 500
          } - ${error.message ?? "Internal server error"}`,
        );
      }
    }

    for (const handler of this.error) {
      const result = await handler(request, error);

      if (result) {
        return result;
      }
    }

    return {
      code: (error.code as any) ?? 500,
      body: {
        message: error.message ?? "Internal server error",
      },
    };
  }

  private debugLog(message: string): void {
    if (this.debug) {
      console.log(message);
    }
  }
}

export function createGrace(
  {
    debug = false,
  }: {
    debug: boolean;
  } = { debug: false },
): Grace {
  return new Grace({ debug });
}
