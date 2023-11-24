import { Grace } from "../grace";
import { OpenAPIV3 } from "openapi-types";
import { TSchema } from "@sinclair/typebox";
import { AnyRoute } from "../types";

export function toOpenAPIPath(path: string) {
  return path
    .split("/")
    .map((x) => (x.startsWith(":") ? `{${x.slice(1, x.length)}}` : x))
    .join("/");
}

function mapTypesResponse(types: string[], schema: TSchema) {
  const responses: Record<string, OpenAPIV3.MediaTypeObject> = {};

  for (const type of types) {
    responses[type] = {
      schema: schema,
    };
  }

  return responses;
}

export function mapProperties(name: string, schema: TSchema | undefined) {
  if (schema === undefined) {
    return [];
  }

  return Object.entries(schema?.properties ?? []).map(([key, value]) => ({
    // @ts-ignore
    ...value,
    in: name,
    name: key,
    // @ts-ignore
    type: value?.type,
    // @ts-ignore
    required: schema!.required?.includes(key) ?? false,
  }));
}

export function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function generateOperationId(method: string, paths: string) {
  let operationId = method.toLowerCase();

  if (paths === "/") {
    return operationId + "Index";
  }

  for (const path of paths.split("/")) {
    if (path.charCodeAt(0) === 123) {
      operationId += "By" + capitalize(path.slice(1, -1));
    } else {
      operationId += capitalize(path);
    }
  }

  return operationId;
}

export function mapRoute(
  route: AnyRoute,
  schema: Partial<OpenAPIV3.PathsObject>,
) {
  const path = toOpenAPIPath(route.path!);
  const method = route.method!;
  const contentTypes = [
    "application/json",
    "multipart/form-data",
    "text/plain",
  ];

  const bodySchema = route.schema?.body;
  const querySchema = route.schema?.query;
  const paramsSchema = route.schema?.params;
  const headerSchema = route.schema?.headers;
  let responseSchema = route.schema
    ?.response as unknown as OpenAPIV3.ResponsesObject;

  if (typeof responseSchema === "object") {
    try {
      Object.entries(responseSchema as Record<string, TSchema>).forEach(
        ([key, value]) => {
          const { type, properties, required, ...rest } =
            value as typeof value & {
              type: string;
              properties: Object;
              required: string[];
            };

          responseSchema[key] = {
            ...rest,
            description: rest.description as any,
            content: mapTypesResponse(contentTypes, value),
          };
        },
      );
    } catch (e) {
      console.error(e);
    }
  }

  const parameters = [
    ...mapProperties("header", headerSchema),
    ...mapProperties("query", querySchema),
    ...mapProperties("path", paramsSchema),
  ];

  schema[path] = schema[path] ?? {};
  schema[path]![method.toLowerCase() as OpenAPIV3.HttpMethods] = {
    ...((headerSchema || paramsSchema || querySchema || bodySchema
      ? ({ parameters } as any)
      : {}) satisfies OpenAPIV3.ParameterObject),
    ...(responseSchema ? { responses: responseSchema } : {}),
    operationId: generateOperationId(method, path),
    ...(bodySchema
      ? {
          requestBody: {
            content: mapTypesResponse(contentTypes, bodySchema as any),
          },
        }
      : {}),
  };
}

export async function exportOpenAPI(
  app: Grace,
  extra: Partial<OpenAPIV3.Document> = {},
) {
  const data: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: {
      title: "Grace",
      version: "1.0.0",
      description: "Grace API",
    },
    paths: {},
    components: {
      schemas: {},
    },
    ...extra,
  };

  for (const route of app.routes) {
    mapRoute(route, data.paths!);
  }

  return data;
}
