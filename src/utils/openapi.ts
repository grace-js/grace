import {zodToJsonSchema} from 'zod-to-json-schema';
import {OpenAPIV3} from 'openapi-types';
import {Grace} from "../grace.js";
import {ZodObject, ZodSchema} from "zod";

function zodSchemaToOpenAPISchemaObject(zodSchema: ZodSchema<any>): OpenAPIV3.SchemaObject {
    const jsonSchema = zodToJsonSchema(zodSchema, 'mySchema');

    return jsonSchema.definitions!.mySchema as OpenAPIV3.SchemaObject;
}

function graceToOpenAPISpec(grace: Grace): OpenAPIV3.Document {
    const paths: OpenAPIV3.PathsObject = {};

    grace.routes.forEach((route) => {
        const path = route.path || '/';
        const method = route.method?.toLowerCase() as keyof OpenAPIV3.PathItemObject;
        const responses: OpenAPIV3.ResponsesObject = {};

        Object.entries(route.schema?.response || {}).forEach(([statusCode, schema]) => {
            if (schema instanceof ZodSchema) {
                const content: OpenAPIV3.MediaTypeObject = {
                    schema: zodSchemaToOpenAPISchemaObject(schema),
                };

                responses[statusCode] = {
                    description: (schema instanceof ZodObject ? schema.shape.description : undefined) || '',
                    content: {
                        'application/json': content,
                    },
                };
            }
        });

        const parameters: OpenAPIV3.ParameterObject[] = [];
        if (route.schema?.params && route.schema.params instanceof ZodObject) {
            Object.keys(route.schema.params.shape).forEach((paramName) => {
                if (!(route.schema?.params && route.schema.params instanceof ZodObject)) {
                    return;
                }

                parameters.push({
                    name: paramName,
                    in: 'path',
                    required: true,
                    schema: zodSchemaToOpenAPISchemaObject(route.schema?.params.shape[paramName]),
                });
            });
        }

        if (route.schema?.query && route.schema.query instanceof ZodObject) {
            Object.keys(route.schema.query.shape).forEach((queryName) => {
                if (!(route.schema?.query && route.schema.query instanceof ZodObject)) {
                    return;
                }

                parameters.push({
                    name: queryName,
                    in: 'query',
                    required: false,
                    schema: zodSchemaToOpenAPISchemaObject(route.schema?.query.shape[queryName]),
                });
            });
        }

        const requestBody: OpenAPIV3.RequestBodyObject | undefined = route.schema?.body
            ? {
                content: {
                    'application/json': {
                        schema: zodSchemaToOpenAPISchemaObject(route.schema.body),
                    },
                },
            }
            : undefined;

        if (!paths[path]) {
            paths[path] = {};
        }

        paths[path]![method as OpenAPIV3.HttpMethods] = {
            responses,
            parameters,
            requestBody,
        };
    });

    return {
        openapi: '3.0.0',
        info: {
            title: 'Generated API',
            version: '1.0.0',
        },
        paths,
    };
}

export {graceToOpenAPISpec};
